import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { Post, Subscriber } from '@project/shared/core';
import { NotifyConfig } from '@project/notify-config';

import { EMAIL_ADD_NEWS_SUBJECT, EMAIL_ADD_SUBSCRIBER_SUBJECT } from './mail.constant';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  @Inject(NotifyConfig.KEY)
  private readonly notifyConfig: ConfigType<typeof NotifyConfig>

  public async sendNotifyNewSubscriber(subscriber: Subscriber) {
    await this.mailerService.sendMail({
      from: this.notifyConfig.mail.from,
      to: subscriber.email,
      subject: EMAIL_ADD_SUBSCRIBER_SUBJECT,
      template: './add-subscriber',
      context: {
        user: `${subscriber.login}`,
        email: `${subscriber.email}`,
      }
    })
  }

  public async sendNews(subscriber: Subscriber, posts: Post[]) {
    await this.mailerService.sendMail({
      from: this.notifyConfig.mail.from,
      to: subscriber.email,
      subject: EMAIL_ADD_NEWS_SUBJECT,
      template: './news',
      context: {
        posts,
        user: `${subscriber.login}`,
        email: `${subscriber.email}`,
      }
    })
  }
}
