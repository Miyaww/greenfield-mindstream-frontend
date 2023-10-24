import { MindStreamContract } from '../base/contract/mindStreamContract';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { BSC_SEND_GAS_FEE } from '../env';

interface IUpdateProfileParams {
  _name: string;
  _avatar: string;
  _bio: string;
}
interface IProfile {
  name: string;
  avatar: string;
  bio: string;
}
export const useProfile = () => {
  const { address } = useAccount();
  const [profile, setProfile] = useState({} as IProfile);
  useEffect(() => {
    if (address) {
      currentUserProfile();
    }
  }, [address]);

  const getProfile = async (address: any) => {
    const profile = await MindStreamContract(false)
      .methods.getProfileByAddress(address)
      .call();
    return profile;
  };
  const updateUserProfile = async (params: IUpdateProfileParams) => {
    const { _name, _avatar, _bio } = params;
    const res = await MindStreamContract(true)
      .methods.updateProfile(_name, _avatar, _bio)
      .send({ from: address, gasPrice: BSC_SEND_GAS_FEE });
    setProfile(res);
    return res;
  };
  const currentUserProfile = async () => {
    const profile = await getProfile(address);
    setProfile(profile);
  };

  return { profile, getProfile, updateUserProfile };
};
