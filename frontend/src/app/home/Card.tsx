"use client"
import { shortenDescription } from "@/utils/shortenDescription"
import Image from "next/image"
import Link from "next/link"
export interface Blog {
    id: string,
    author: string,
    title: string,
    description: string,
    image: string,
    likes: string[],
}
interface CardProps {
    blog: Blog
}
export function Card({ blog }: CardProps) {
    return (
        <div className="col-md-4">
            <div className="border border-2 border-info  rounded p-3 text-center mb-3">
                <Image className="mb-3 rounded" src={blog.image} alt={"title"} width={250} height={250} />
                <h5 className="">{blog.title}</h5>
                <p className="">{shortenDescription(blog.description)}</p>
                <p className="">{blog.likes.length} likes</p>
                <p>Author: {shortenDescription(blog.author)}</p>
                <Link href={`/${blog.id}`}>Read Full Blog</Link>
            </div>
        </div>
    )
}