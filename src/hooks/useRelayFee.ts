import { useEffect, useState } from 'react';
import { MindStreamContract } from '../base/contract/mindStreamContract';

export const useRelayFee = () => {
  const [relayFee, setRelayFee] = useState(0);

  useEffect(() => {
    MindStreamContract(false)
      .methods.getMinRelayFee()
      .call()
      .then((result: any) => {
        setRelayFee(result);
      });
  }, []);

  return { relayFee };
};
