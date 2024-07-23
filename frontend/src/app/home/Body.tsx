"use client"

import { useEffect, useState } from "react";
import { Blog, Card } from "./Card"
import { getAptosClient } from "@/utils/aptosClient";
import { moduleAddress } from "@/utils/moduleAddress";
import { Loading } from "@/components/Loading";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";
const aptosClient = getAptosClient();

export function Body() {
    const { account, connected, signAndSubmitTransaction } = useWallet();
    const [blogsLoading, setBlogsLoading] = useState(false)
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image: ""
    });
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const getBlogs = async () => {
        try {
            setBlogsLoading(true)
            const bloglistResource = await aptosClient.getAccountResource({
                accountAddress: moduleAddress,
                resourceType: `${moduleAddress}::blogs::BlogList`
            });
            const tableHandle = (bloglistResource as any).blogs.handle;
            const blogCounter = (bloglistResource as any).counter;
            let blogs = [];
            let counter = 1;
            while (counter <= blogCounter) {
                const tableItem = {
                    key_type: "u64",
                    value_type: `${moduleAddress}::blogs::Blog`,
                    key: `${counter}`
                };
                const blog = await aptosClient.getTableItem<Blog>({ handle: tableHandle, data: tableItem });
                blogs.push(blog)
                counter ++;
            };
            setBlogs(blogs)
        } catch (error) {
            console.log(error);
        } finally {
            setBlogsLoading(false)
        }
    };
    const onAddBlog = async() => {
        if(!account || Object.values(formData).includes("")) return;
        try {
            setTransactionInProgress(true)
            const transaction: InputTransactionData = {
                data: {
                    function: `${moduleAddress}::blogs::create_blog`,
                    functionArguments: [formData.title, formData.description, formData.image]
                }
            }
            const response = await signAndSubmitTransaction(transaction);
            await aptosClient.waitForTransaction({ transactionHash: response.hash });
            getBlogs()
        } catch (error) {
            console.error(error)
        } finally {
            setTransactionInProgress(false)
        }
    }
    useEffect(() => {
        getBlogs();
    }, [])

    if(blogsLoading) return <Loading />;
    return (
        <section>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0 text-info">Total Blogs: {blogs.length}</h4>
                <form className="d-flex justify-content-end gap-2 mb-3">
                    <input type="text" name="title" className="p-2" placeholder="Title" value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} />
                    <input type="text" name="description" className="p-2" placeholder="Description" value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} />
                    <input type="text" name="image" className="p-2" placeholder="Image Link" value={formData.image} onChange={(e)=>setFormData({...formData, image: e.target.value})}/>
                    <button type="button" className="btn btn-success" onClick={onAddBlog} disabled={!connected || transactionInProgress}>Add Blog</button>
                </form>
                </div>
                <hr />
                <div className="row">
                    {
                        blogs.map((blog, index)=>(
                            <Card key={index} blog={blog}/>
                        ))
                    }
                </div>
            </div>
        </section>
    )
}