"use client"

import Image from "next/image";
import { BorderBeam } from "@/components/ui/border-beam";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { fireApiAction } from "@/config/api";
import { redirect } from "next/navigation";
import Head from "next/head";

export default function Home() {
  async function fetchUUID() {
    const result = await fireApiAction("api/create?action=create_bill", "GET", {})
    return result.uuid;
  }
  return (
    <>
    <Head>
      <title>Splitzer</title>
      <meta name="description" content="Split the bill" />
      <meta name="title" content="Splitzer" />
    </Head>
    <div className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl gap-16">
      <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
        Split the bill
      </span>
      <span>
        <RainbowButton
          onClick={() => {
            fetchUUID().then(uuid => {
              redirect(`/${uuid}`);
            });
          }}
        >Calculate</RainbowButton>
      </span>
      <BorderBeam size={250} duration={12} delay={9} />
    </div>

    </>
  );
}
