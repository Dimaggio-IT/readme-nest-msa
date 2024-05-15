import 'multer';
import FormData from 'form-data';
import { Request } from 'express';
import { HttpService } from '@nestjs/axios';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  Param,
  UseFilters,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
} from '@nestjs/common';

import { ChangePasswordUserDto, CreateUserDto, LoginUserDto } from '@project/authentication';

import { ApplicationServiceURL } from './app.config';
import { AxiosExceptionFilter } from './filters/axios-exception.filter';
import { UserInfo } from './app.constant';
import { CheckAuthGuard } from './guards/check-auth.guard';
import { InjectUserIdInterceptor } from '@project/interceptors';
import { MongoIdValidationPipe } from '@project/pipes';
import { MAX_AVATAR_SIZE } from '@project/file-uploader';

@ApiTags('users')
@Controller('users')
@UseFilters(AxiosExceptionFilter)
export class UsersController {
  constructor(
    private readonly httpService: HttpService
  ) { }

  @ApiOkResponse({
    isArray: false,
    description: UserInfo.Register,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      files: 1,
      fieldSize: MAX_AVATAR_SIZE,
    },
  }))
  @Post('registration')
  public async register(@Req() req: Request, @Body() createUserDto: CreateUserDto, @UploadedFile() file: Express.Multer.File) {
    let path;

    if (file) {
      const formData = new FormData();
      formData.append('file', Buffer.from(file.buffer), file.originalname);
      const { data: avatar } = await this.httpService.axiosRef.post(`${ApplicationServiceURL.Files}/upload/avatar`, formData, {
        headers: {
          'Content-Type': req.headers['content-type'],
          ...formData.getHeaders()
        }
      });

      path = avatar.path;
    }

    const { data: user } = await this.httpService.axiosRef.post(`${ApplicationServiceURL.Users}/register`, { ...createUserDto, avatar: path });

    return user;
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: UserInfo.Login,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: UserInfo.InvalidData,
  })
  @ApiBody({
    required: true,
    isArray: false,
    type: LoginUserDto,
  })
  @Post('login')
  public async login(@Body() loginUserDto: LoginUserDto) {
    const { data } = await this.httpService.axiosRef.post(`${ApplicationServiceURL.Users}/login`, loginUserDto);

    return data;
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: UserInfo.Refresh,
  })
  @ApiBearerAuth()
  @Post('refresh')
  public async refreshToken(@Req() req: Request) {
    const { data } = await this.httpService.axiosRef.post(`${ApplicationServiceURL.Users}/refresh`, null, {
      headers: {
        'Authorization': req.headers['authorization']
      }
    });

    return data;
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: UserInfo.PasswordChanged,
  })
  @ApiBearerAuth()
  @UseGuards(CheckAuthGuard)
  @UseInterceptors(InjectUserIdInterceptor)
  @Post('change-password')
  public async changePassword(@Body() dto: ChangePasswordUserDto) {
    const { data } = await this.httpService.axiosRef.post(`${ApplicationServiceURL.Users}/update-password`, dto);

    return data;
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: UserInfo.UserFound,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: UserInfo.NotFound,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @Get('/:id')
  public async show(@Param('id', MongoIdValidationPipe) id: string) {
    const { data: userData } = await this.httpService.axiosRef.get(`${ApplicationServiceURL.Users}/${id}`);
    const { data: postsCount } = await this.httpService.axiosRef.get(`${ApplicationServiceURL.Blog}/user-posts-count/${id}`);
    let avatar = null;

    if (userData.avatar) {
      avatar = await this.httpService.axiosRef.get(`${ApplicationServiceURL.Files}/upload/${userData.avatar}`);
    }

    return { ...userData, postsCount, avatar };
  }
}
