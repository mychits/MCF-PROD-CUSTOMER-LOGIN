import { NextRequest } from "next/server";

export function proxy(request:NextRequest){
    console.log(new URL(request.url))

}