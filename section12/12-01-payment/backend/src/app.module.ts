import { CacheModule, Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';

import { BoardModule } from './apis/boards/boards.module';
import { ProductsModule } from './apis/products/products.module';
import { ProductsCategoriesModule } from './apis/productCategory/productsCategories.module';
import { UsersModule } from './apis/users/users.module';
import { AuthModule } from './apis/auth/auth.module';
import { PointsTransactionsModule } from './apis/pointsTransactions/pointsTransactions.module';
import { PaymentsMoudle } from './apis/payments/payments.module';
import { FilesModule } from './apis/files/files.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    BoardModule,
    FilesModule,
    PaymentsMoudle,
    PointsTransactionsModule,
    ProductsModule,
    ProductsCategoriesModule,
    ConfigModule.forRoot(), // process.env보다 위에 있어야 읽을 수 있음
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/common/graphql/schema.gql',
      /**
       * 여기서 context를 작성해줘야 resolver @Context로 받을 수 있음
       * 작성 안해주면 default로 req는 가지만 res는 안 감
       */
      context: ({ req, res }) => ({
        req, //
        res,
      }),
    }),
    // TODO .env로 변경필요
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      entities: [__dirname + '/apis/**/*.entity.*'],
      synchronize: true,
      logging: true,
    }),
    // 하던중
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      url: 'redis://my-redis:6379', // Docker간에는 name resolution 가능
      isGlobal: true,
    }),
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
