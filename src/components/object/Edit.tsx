import styled from '@emotion/styled';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useSearchParams } from 'react-router-dom';

import {
  Button,
  Box,
  Input,
  LightMode,
  RadioGroup,
  Radio,
  HStack,
} from '@totejs/uikit';
import MDEditor from '@uiw/react-md-editor';
import { UploadModal } from '../modal/UploadModal';
import { useChannelList } from '../../hooks/useChannelList';

export const EditObject = () => {
  const { address } = useAccount();
  const [value, setValue] = useState('**Write your blog**');
  const [title, setTitle] = useState('');
  const [p] = useSearchParams();
  const bucket_name = p.get('bucketName') || '';
  const bucket_id = p.get('bucketId') || '';

  const [bucketName, setBucketName] = useState(bucket_name);
  const [bucketId, setBucketId] = useState(bucket_id);

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File>();
  const { list: channelList, loading: listLoading } = useChannelList(
    address as string,
  );

  const onChange = (event: any) => {
    if (!event.target.value) return;
    setTitle(event.target.value);
  };
  const handleSubmit = (value: string) => {
    const blob = new Blob([value], { type: 'text/markdown' });
    const editorFile = new File([blob], 'myFile.md', { type: 'text/markdown' });
    setFile(editorFile);
  };
  return (
    <Container>
      <Title>Write Blog</Title>
      <Subtitle>Channel:</Subtitle>
      {bucket_name ? (
        <Box>
          {bucket_name.includes('public')
            ? 'Public Channel'
            : 'Private Channel'}
        </Box>
      ) : (
        <RadioGroup
          mb={24}
          value={bucketName}
          onChange={(e) => {
            if (!e) return;
            setBucketName(e.toString());
            const id = channelList?.find(
              (item: any) => item.BucketInfo?.BucketName === e,
            )?.BucketInfo?.Id;
            setBucketId(id || '');
          }}
        >
          <HStack alignItems="flex-start" spacing={24}>
            {!listLoading &&
              channelList?.map((item: any) => {
                return (
                  <Radio
                    sx={{
                      span: {
                        borderColor: 'readable.normal',
                      },
                    }}
                    key={item.BucketInfo?.BucketName}
                    value={item.BucketInfo?.BucketName}
                  >
                    {item.BucketInfo?.BucketName.includes('public')
                      ? 'Public Channel'
                      : 'Private Channel'}
                  </Radio>
                );
              })}
          </HStack>
        </RadioGroup>
      )}

      <Subtitle>Title:</Subtitle>
      <LightMode>
        <Input
          defaultValue={title}
          onChange={onChange}
          placeholder="Please enter title..."
          maxLength={100}
          mb="24"
          bg="bg.top.normal"
        />
      </LightMode>
      <Subtitle>Content:</Subtitle>

      <MDEditor
        height={500}
        value={value}
        onChange={(newValue) => {
          setValue(newValue || '');
        }}
      />
      <Button
        w="fit-content"
        mt="40"
        disabled={!title || !bucketName}
        onClick={() => {
          handleSubmit(value);
          setOpen(true);
        }}
      >
        Submit
      </Button>
      <UploadModal
        isOpen={open}
        handleOpen={() => {
          setOpen(false);
        }}
        detail={{
          bucket_name: bucketName,
          object_name: title,
          file,
          bucketId,
          address,
        }}
      />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  > div {
    width: 100%;
  }
  .w-md-editor-text-pre > code,
  .w-md-editor-text-input {
    font-family: 'Space Grotesk' !important;
  }
`;
const Title = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 32px;
  line-height: 40px;
  margin-bottom: 40px;
  text-align: center;
`;
const Subtitle = styled.div`
  font-style: normal;
  font-size: 24px;
  line-height: 32px;
  color: #ffffff;
  margin-bottom: 20px;
`;
