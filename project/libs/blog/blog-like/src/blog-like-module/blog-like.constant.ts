export enum LikesInfo {
  Add = 'Like added',
  Show = 'Like by post',
  Delete = 'Like removed',
}

export const LikeError = {
  AlreadyExist: 'You already liked this Post',
  NoExistLikeId: 'You are trying to delete a non-existent like',
  NoCorrespondingUser: 'You cannot delete another users like'
} as const;

export const BlogLikeValidateMessage = {
  InvalidPostID: 'Invalid post id',
  InvalidUserID: 'Invalid user id',
} as const;
