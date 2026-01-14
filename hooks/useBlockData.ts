import { getBlocks } from "@/lib/api_request/blockFetcher.lib";
import { useEffect, useState } from "react";

export interface Block {
  number: number;
}

export const useBlockData = () => {
  const [recentBlocks, setRecentBlocks] = useState<Block[]>([]);
  const [latestBlock, setLatestBlock] = useState<Block>({ number: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchBlock = async () => {
    try {
      setIsLoading(true);
      const blocks = await getBlocks();
      setRecentBlocks(blocks);
      setLatestBlock(blocks[0]);
      console.log("Getting the Latest Base Blocks", blocks);
    } catch (error) {
      if (error instanceof Error) console.log(error.message);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlock();
  }, []);

  return {
    recentBlocks,
    latestBlock,
    isError,
    isLoading,
    fetchBlock,
  };
};
