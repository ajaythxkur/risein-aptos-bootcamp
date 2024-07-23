module my_addr::blogs{
    use std::signer;
    use std::table::{Self, Table};
    use std::vector;
    use std::string::{Self, String};
    use std::coin::transfer;

    struct BlogList has key {
        counter: u64,
        blogs: Table<u64, Blog>
    }

    struct Blog has store, drop, copy {
        id: u64,
        author: address,
        title: String,
        description: String,
        image: String,
        likes: vector<address>,
    }

    const EBLOG_NOT_EXIST: u64 = 0;
    const EALREADY_LIKED: u64 = 1;
    const ENOT_LIKED: u64 = 2;
    const ETITLE_LEN_EXCEED: u64 = 3;
    const EDESC_LEN_EXCEED: u64 = 4;

    const TITLE_UPPER_BOUND: u64 = 40;
    const DESCRIPTION_UPPER_BOUND: u64 = 5000;

    fun init_module(owner: &signer){
        move_to(
            owner,
            BlogList {
                counter: 0,
                blogs: table::new()
            },
        )
    }

    public entry fun create_blog(creator: &signer, title: String, description: String, image: String) acquires BlogList {
        assert!(string::length(&title) <= TITLE_UPPER_BOUND, ETITLE_LEN_EXCEED);
        assert!(string::length(&description) <= DESCRIPTION_UPPER_BOUND, EDESC_LEN_EXCEED);
        let creator_addr = signer::address_of(creator);
        let blog_list = borrow_global_mut<BlogList>(@my_addr);
        let counter = blog_list.counter + 1;
        let blog = Blog {
            id: counter,
            author: creator_addr,
            title,
            description,
            image,
            likes: vector::empty(),
        };
        table::add(&mut blog_list.blogs, counter, blog);
        blog_list.counter = counter;
    }

    public entry fun like(account: &signer, blog_id: u64) acquires BlogList {
        let account_addr = signer::address_of(account);
        let blog_list = borrow_global_mut<BlogList>(@my_addr);
        assert!(table::contains(&blog_list.blogs, blog_id), EBLOG_NOT_EXIST);
        let blog = table::borrow_mut(&mut blog_list.blogs, blog_id);
        assert!(!vector::contains(&blog.likes, &account_addr), EALREADY_LIKED);
        vector::push_back(&mut blog.likes, account_addr);
    }

    public entry fun unlike(account: &signer, blog_id: u64) acquires BlogList {
        let account_addr = signer::address_of(account);
        let blog_list = borrow_global_mut<BlogList>(@my_addr);
        assert!(table::contains(&blog_list.blogs, blog_id), EBLOG_NOT_EXIST);
        let blog = table::borrow_mut(&mut blog_list.blogs, blog_id);
        let (exist, index) = vector::index_of(&blog.likes, &account_addr);
        assert!(exist, ENOT_LIKED);
        vector::remove(&mut blog.likes, index);
    }

    public entry fun donate<CoinType>(account: &signer, blog_id: u64, amount: u64) acquires BlogList {
        let blog_list = borrow_global<BlogList>(@my_addr);
        assert!(table::contains(&blog_list.blogs, blog_id), EBLOG_NOT_EXIST);
        let blog = table::borrow(&blog_list.blogs, blog_id);
        transfer<CoinType>(account, blog.author, amount);
    }
    
    #[view]
    public fun get_blog(blog_id: u64): (u64, address, String, String, String, vector<address>) acquires BlogList {
        let blog_list = borrow_global<BlogList>(@my_addr);
        assert!(table::contains(&blog_list.blogs, blog_id), EBLOG_NOT_EXIST);
        let blog = table::borrow(&blog_list.blogs, blog_id);
        (blog.id, blog.author, blog.title, blog.description, blog.image, blog.likes)
    }

    #[view]
    public fun num_blogs(): (u64) acquires BlogList {
        borrow_global<BlogList>(@my_addr).counter
    }

    #[test_only]
    use std::string::utf8;

    #[test_only]
    use aptos_framework::account;

    #[test(account=@my_addr)]
    fun test_create_blog(account: &signer) acquires BlogList {
        let account_addr = signer::address_of(account);
        account::create_account_for_test(account_addr);
        init_module(account);
        create_blog(account, utf8(b"Aptos bootcamp"), utf8(b"The world of blockchain is full of possibilities! In this final project, you have the freedom to design and create your own smart contract on the Aptos. Let your imagination run wild and build a smart contract that solves a problem, enhances an existing system, or introduces something entirely new."), utf8(b"https://files.risein.com/bootcamps/build-on-aptos-bootcamp-india/B6P-E-cohorts-cover.png"));
    }   

    #[test(account=@0x123, liker=@0x432)]
    fun test_like_blog(account: &signer, liker: &signer) acquires BlogList {
        let account_addr = signer::address_of(account);
        let liker_addr = signer::address_of(liker);
        account::create_account_for_test(account_addr);
        account::create_account_for_test(liker_addr);
        init_module(account);
        create_blog(account, utf8(b"title"), utf8(b"description"), utf8(b"image"));
        like(liker, 1);
    }

    #[test(account=@0x123, liker=@0x432)]
    fun test_unlike_blog(account: &signer, liker: &signer) acquires BlogList {
        let account_addr = signer::address_of(account);
        let liker_addr = signer::address_of(liker);
        account::create_account_for_test(account_addr);
        account::create_account_for_test(liker_addr);
        init_module(account);
        create_blog(account, utf8(b"title"), utf8(b"description"), utf8(b"image"));
        like(liker, 1);
        unlike(liker, 1);
    }

    #[test_only]
    struct TestCoin {}

    #[test_only]
    use aptos_framework::managed_coin;

    #[test_only]
    use std::coin;

    #[test(account=@my_addr, author=@0x432, donator=@0x123)]
    public entry fun test_donate_author(account: &signer, author: &signer, donator: &signer) acquires BlogList {
        let account_addr = signer::address_of(account);
        let author_addr = signer::address_of(author);
        let donator_addr = signer::address_of(donator);

        account::create_account_for_test(account_addr);
        account::create_account_for_test(author_addr);
        account::create_account_for_test(donator_addr);

        managed_coin::initialize<TestCoin>(account, b"Test Coin", b"TEST", 8, false);

        managed_coin::register<TestCoin>(author);
        managed_coin::register<TestCoin>(donator);

        managed_coin::mint<TestCoin>(account, donator_addr, 100000000); // 1 Coin
        assert!(coin::balance<TestCoin>(donator_addr) == 100000000, 500);

        init_module(account);
        create_blog(author, utf8(b"title"), utf8(b"description"), utf8(b"image"));

        donate<TestCoin>(donator, 1, 10000000); // 0.1
        assert!(coin::balance<TestCoin>(author_addr) == 10000000, 400);
    }

}