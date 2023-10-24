import { get } from '../../base/http';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Flex, Box, Image, Divider } from '@totejs/uikit';
import { useProfile } from '../../hooks/useProfile';
import { useChannelInfo } from '../../hooks/useChannelInfo';
import { useStatus } from '../../hooks/useStatus';
import { convertUnixTimeStampToDate } from '../../utils/time';
import { useSubscribe } from '../../hooks/useSubscribe';

import { useAsyncEffect } from 'ahooks';
import { useAccount } from 'wagmi';

interface IProfile {
  avatar: string;
  name: string;
}
export const FileInfo = () => {
  const { address } = useAccount();
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [followed, setFollowed] = useState<boolean>(false);
  const location = useLocation();
  const [p] = useSearchParams();
  const groupName = p.get('groupName') || '';
  const [profile, setProfile] = useState<IProfile>({} as IProfile);
  const { fileTitle, createAt, owner, channel } = location.state;
  const { getObjectPreviewLink } = useChannelInfo();

  const { getProfile } = useProfile();
  const lastIndex = fileTitle.lastIndexOf('-');
  const title = fileTitle.substring(0, lastIndex);
  const [noPermission, setNoPermission] = useState<boolean>(false);
  // const { subscribe } = useSubscribe(channel, owner);

  useAsyncEffect(async () => {
    if (!owner) return;
    const res = await getProfile(owner);
    setProfile(res);
  }, [owner]);
  useEffect(() => {
    const followList = localStorage.getItem('followList') || '';
    if (followList.includes(owner)) {
      setFollowed(true);
    }
  }, []);
  const { status } = useStatus(groupName, owner, address as string);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let previewUrl;
        if (status === 2 || status === 0) {
          setNoPermission(false);
          previewUrl = await getObjectPreviewLink(fileTitle, channel);
        } else {
          setNoPermission(true);
          return;
        }
        if (!previewUrl) return;
        const response = await get({
          url: previewUrl,
        });
        const data = response;
        setMarkdownContent(data);
      } catch (error) {
        // Handle the error
        console.error(error);
      }
    };
    fetchData();
  }, [status, owner, groupName]);
  const handleFollow = () => {
    const followList = localStorage.getItem('followList') || '';
    localStorage.setItem('followList', followList + ',' + owner);
    setFollowed(true);
  };

  return (
    <Flex w="100%" direction={'column'} pt={24}>
      <Box fontSize={60} textAlign={'center'} mt={64} fontWeight={700} mb={24}>
        {title}
      </Box>
      {profile && (
        <Flex>
          <Image src={profile.avatar} w={50} h={50} borderRadius={50}></Image>
          <Box ml={9}>
            <Flex alignItems={'flex-end'}>
              <Box fontSize={24} lineHeight={'32px'}>
                {profile.name}
              </Box>
              {followed ? (
                <Box
                  ml={18}
                  lineHeight={'32px'}
                  color="scene.success.active"
                  fontSize={16}
                >
                  Followed
                </Box>
              ) : (
                <Box
                  ml={18}
                  lineHeight={'32px'}
                  color="scene.primary.normal"
                  onClick={() => handleFollow()}
                  _hover={{ cursor: 'pointer' }}
                  fontSize={16}
                >
                  Follow
                </Box>
              )}
            </Flex>
            <Box fontSize={16}>{convertUnixTimeStampToDate(createAt)}</Box>
          </Box>
        </Flex>
      )}
      <Divider my={20} />
      <Flex>
        <Box
          color={'#B9B9BB'}
          fontSize={20}
          sx={{
            span: {
              color: '#FFF',
            },
          }}
        >
          Published in <span>{channel}</span> Channel
        </Box>
      </Flex>
      <Divider my={20} />
      {noPermission ? (
        <Box>Please subscribe to view this file</Box>
      ) : (
        <Box fontSize={20} mb={20}>
          <ReactMarkdown>{markdownContent}</ReactMarkdown>
        </Box>
      )}
    </Flex>
  );
};
