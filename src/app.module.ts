import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerModule } from './player/player.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpErrorFilter } from './shared/http-error.filter';
import { LoggingInterceptor } from './shared/logging.interceptor';
import { LobbyModule } from './lobby/lobby.module';
import { AppGateway } from './app.gateway';

@Module({
  imports: [TypeOrmModule.forRoot(), PlayerModule,LobbyModule],
  controllers: [AppController],
  providers: [AppService,AppGateway,{
    provide: APP_FILTER,
    useClass:HttpErrorFilter
  },
    {
      provide:APP_INTERCEPTOR,
      useClass:LoggingInterceptor
    }],
})
export class AppModule {}
