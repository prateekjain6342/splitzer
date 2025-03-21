"use client"

import React from 'react'
import { fireApiAction } from "@/config/api";
import { VscLoading } from "react-icons/vsc";
import { useRouter } from 'next/navigation';

export default function Home() {

  const [ctaText, setCtaText] = React.useState("Create a new bill split");
  const [loadingSpinner, setLoadingSpinner] = React.useState(true);

  async function fetchUUID() {
    setCtaText("Loading");
    setLoadingSpinner(false);
    const result = await fireApiAction("api/create?action=create_bill", "GET", {})
    return result.uuid;
  }
  
  const router = useRouter();
  return (
    <>
      <div
        className="flex flex-col h-[calc(100dvh-96px)] lg:h-[calc(100dvh-112px)] justify-center items-center gap-32 bg-primaryDarkBlue"
      >
        <div className="font-plusjakarta text-[#D6DDE6] flex-0 text-5xl lg:text-6xl xl:text-8xl text-center">
          Easily <span className="underline decoration-secondaryGreen">Split Bills</span> with Friends
        </div>
        <button 
          className="font-plusjakarta text-[#000A14] flex-0 bg-secondaryGreen w-fit p-4 rounded-lg text-center font-bold flex flex-row gap-2"
          onClick={() => {
            fetchUUID().then(uuid => {
              router.push(`/${uuid}`)
            });
          }}
        >
          <VscLoading className='my-auto animate-spin' hidden={loadingSpinner} />
          {ctaText}
        </button>
      </div>
    </>
  );
}
