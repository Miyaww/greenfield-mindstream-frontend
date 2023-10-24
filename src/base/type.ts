export interface IGroupItem {
  groupName: string;
  groupId: string;
  ownerAddress: string;
}
export type BucketProps = {
  BucketInfo: {
    BucketName: string;
    BucketStatus: number;
    ChargedReadQuota: string;
    CreateAt: string;
    GlobalVirtualGroupFamilyId: number;
    Id: string;
    Owner: string;
    PaymentAddress: string;
    SourceType: string;
    Visibility: number;
  };
  CreateTxHash: string;
  DeleteAt: string;
  DeleteReason: string;
  Operator: string;
  Removed: boolean;
  UpdateAt: string;
  UpdateTime: string;
  UpdateTxHash: string;
  groupName: string;
  groupId: number;
  status?: number;
};
export interface ObjectInfo {
  BucketName: string;
  Checksums: string[];
  ContentType: string;
  CreateAt: number;
  Creator: string;
  Id: number;
  LocalVirtualGroupId: number;
  ObjectName: string;
  ObjectStatus: number;
  Owner: string;
  PayloadSize: number;
  RedundancyType: number;
  SourceType: number;
  Visibility: number;
}
