"use client"

import { useEffect, useState } from "react"
import { getAptosClient } from "@/utils/aptosClient"
import { moduleAddress } from "@/utils/moduleAddress";
import { Loading } from "@/components/Loading";
import { InputViewFunctionData } from "@aptos-labs/ts-sdk";
import { Blog } from "@/app/home/Card";
import Image from "next/image";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";
import Link from "next/link";
import { shortenDescription } from "@/utils/shortenDescription";
import toast from "react-hot-toast";
const aptosClient = getAptosClient();

interface SingleBlogProps {
    id: string
}

export function SingleBlog({ id }: SingleBlogProps) {
    const { account, connected, signAndSubmitTransaction } = useWallet()
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState<Blog | null>(null);
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const [amount, setAmount] = useState("")
    const fetchSingleBlog = async () => {
        try {
            setLoading(true);
            const payload: InputViewFunctionData = {
                function: `${moduleAddress}::blogs::get_blog`,
                typeArguments: [],
                functionArguments: [id],
            }
            const [blog_id, author, title, description, image, likes] = await aptosClient.view({
                payload: payload
            });
            setBlog({
                id: blog_id as string,
                author: author as string,
                title: title as string,
                description: description as string,
                image: image as string,
                likes: likes as string[]
            })
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    const onLike = async () => {
        if (!account || transactionInProgress) return;
        try {
            setTransactionInProgress(true);
            const transaction: InputTransactionData = {
                data: {
                    function: `${moduleAddress}::blogs::like`,
                    functionArguments: [id]
                }
            };
            const response = await signAndSubmitTransaction(transaction);
            await aptosClient.waitForTransaction({ transactionHash: response.hash });
            setBlog((prev) => {
                if (prev) {
                    prev.likes.push(account.address);
                    return prev;
                }
                return prev;
            })
        } catch (error) {
            console.error(error)
        } finally {
            setTransactionInProgress(false)
        }
    }
    const onUnlike = async () => {
        if (!account || transactionInProgress) return;
        try {
            setTransactionInProgress(true);
            const transaction: InputTransactionData = {
                data: {
                    function: `${moduleAddress}::blogs::unlike`,
                    functionArguments: [id]
                }
            };
            const response = await signAndSubmitTransaction(transaction);
            await aptosClient.waitForTransaction({ transactionHash: response.hash });
            setBlog((prev) => {
                if (prev) {
                    const newLikes = prev.likes.filter((addr) => account.address !== addr);
                    prev.likes = newLikes;
                    return prev;
                }
                return prev;
            })
        } catch (error) {
            console.error(error)
        } finally {
            setTransactionInProgress(false)
        }
    }
    const donate = async() => {
        if(!account) return;
        try {
            setTransactionInProgress(true)
            const amountInOcta = Number(amount) * Math.pow(10, 8);
            const transaction: InputTransactionData = {
                data: {
                    function: `${moduleAddress}::blogs::donate`,
                    typeArguments: ["0x1::aptos_coin::AptosCoin"],
                    functionArguments: [id, amountInOcta.toString()]
                }
            };
            const response = await signAndSubmitTransaction(transaction);
            await aptosClient.waitForTransaction({ transactionHash: response.hash });
            setAmount("")
            toast.success(`Successfully donated ${amount} Aptos`)
        } catch (error) {
            console.error(error) 
        } finally {
            setTransactionInProgress(false)
        }
    }
    useEffect(() => {
        fetchSingleBlog()
    }, [])
    if (loading) return <Loading />;
    if (!blog) return null;
    return (
        <section>
            <div className="container">
                <Link href="/" className="text-primary">Back</Link>
                <h3 className="text-info d-flex align-items-center mt-3">{blog.title}&nbsp;
                </h3>
                <div className="row">
                    <div className="col-md-6">
                        <Image className="mb-3" alt={blog.title} src={blog.image} height={500} width={500} />

                    </div>
                    <div className="col-md-6">
                        <p>{blog.description}</p>
                    </div>
                </div>
                <div className="text-white">
                    Enjoyed reading?? Give {shortenDescription(blog.author)} a like!!! &nbsp;
                    {connected && account &&
                        blog.likes.includes(account.address)
                        ?
                        <Image alt="like-dislike" src={"/liked.svg"} width={24} height={24} className="cursor-pointer" onClick={onUnlike} />
                        :
                        <Image alt="like-dislike" src={"/not-liked.svg"} width={24} height={24} className="cursor-pointer" onClick={onLike} />
                    }
                    <form className="d-flex gap-2">
                        <input type="text" name="amount" placeholder="Aptos amount" className="p-2" value={amount} onChange={(e)=>setAmount(e.target.value)}/>
                        <button type="button" className="btn btn-success" onClick={donate} disabled={transactionInProgress || !connected}>Donate Aptos</button>
                    </form>
                </div>
            </div>
        </section>
    )
}