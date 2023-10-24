import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { checkAddressInGroup } from '../utils/gfSDK';

export const useStatus = (
  groupName: string,
  groupOwner: string,
  member: string,
) => {
  // -1 do not login
  // 0 owner
  // 1 login not sub
  // 2 subscribed
  const { address } = useAccount();
  const [status, setStatus] = useState(address ? 1 : -1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(
      groupName,
      groupOwner,
      member,
      'groupName, groupOwner, member, useStatus',
    );
    if (!groupName) return;
    if (address && address === groupOwner) setStatus(0);
    if (address && address !== groupOwner) {
      checkAddressInGroup(groupName, groupOwner, member)
        .then((result) => {
          console.log(result, 'res');
          if (result) {
            setStatus(2);
          } else {
            setStatus(1);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [groupName, address, groupOwner, member]);

  return { loading, status };
};
