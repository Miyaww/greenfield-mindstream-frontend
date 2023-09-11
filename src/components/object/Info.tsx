import { get } from '../../base/http';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router-dom';
import { Flex, Box, Image, Divider } from '@totejs/uikit';
import { useProfile } from '../../hooks/useProfile';
import { useChannelInfo } from '../../hooks/useChannelInfo';

import { useAsyncEffect } from 'ahooks';
import { convertUnixTimeStampToDate } from '../../utils/time';
import { useAccount } from 'wagmi';

interface IProfile {
  avatar: string;
  name: string;
}

export const FileInfo = () => {
  const { address } = useAccount();
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const location = useLocation();
  const [profile, setProfile] = useState<IProfile>({} as IProfile);
  const {
    previewLink,
    fileTitle,
    createAt,
    owner,
    channel,
    isPrivate,
    bucketId,
  } = location.state;
  console.log(previewLink, isPrivate);
  const { bucketInfo, getObjectPreviewLink } = useChannelInfo(
    bucketId,
    channel,
  );
  const { getProfile } = useProfile();
  const lastIndex = fileTitle.lastIndexOf('-');
  const title = fileTitle.substring(0, lastIndex);
  useAsyncEffect(async () => {
    if (!owner) return;
    const res = await getProfile(owner);
    setProfile(res);
  }, [owner]);
  const handleSubscribe = () => {
    //todo
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let previewUrl;
        if (isPrivate) {
          previewUrl = await getObjectPreviewLink(fileTitle);
          console.log(1);
        } else {
          previewUrl = previewLink;
        }
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
  }, []);
  const handleFollow = () => {
    const followList = localStorage.getItem('followList') || '';
    localStorage.setItem('followList', followList + ',' + owner);
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
              <Box
                ml={18}
                lineHeight={'32px'}
                color="#FFC130"
                onClick={() => handleFollow()}
                _hover={{ cursor: 'pointer' }}
                fontSize={16}
              >
                Follow
              </Box>
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
        {address !== owner && (
          <Box
            ml={24}
            color="#FFC130"
            fontSize={16}
            onClick={() => handleSubscribe()}
            _hover={{ cursor: 'pointer' }}
          >
            Subscribe
          </Box>
        )}
      </Flex>
      <Divider my={20} />
      <Box fontSize={20} mb={20}>
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </Box>
    </Flex>
  );
};
