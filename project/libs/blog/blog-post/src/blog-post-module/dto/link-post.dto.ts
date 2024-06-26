import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl, MaxLength } from 'class-validator';

import { POST_LINK_DESCRIPTION_LENGTH } from '../blog-post.constant';
import { BasePostDto } from './base-post.dto';

export class CreateLinkPostDto extends BasePostDto {
  @ApiProperty({
    description: 'Reference to some resource',
    example: 'https://example.com',
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  public link: string;

  @ApiProperty({
    description: 'Post link description',
    example: 'Description',
  })
  @IsString()
  @MaxLength(POST_LINK_DESCRIPTION_LENGTH)
  public description?: string;
}
