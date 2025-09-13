import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,  // auto-generate schema.graphql
      playground: true,      // enable GraphQL playground
      sortSchema: true,      // keeps schema organized
    }),
  ],
})
export class AppGraphQLModule {}
