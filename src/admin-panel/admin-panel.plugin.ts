import { INestApplication } from '@nestjs/common';
import { Database, Resource } from 'admin-bro-typeorm';
import AdminBro from 'admin-bro';
import * as AdminBroExpress from 'admin-bro-expressjs';
import { Player } from '../player/player.entity';
import { Lobby } from '../lobby/lobby.entity';
import { Issue } from '../issue/issue.entity';

export async function setupAdminPanel(app: INestApplication): Promise<void> {

  /**
   * Register TypeORM adapter for using
   */
  AdminBro.registerAdapter({ Database, Resource });

  const adminBro = new AdminBro({
    resources: [Player,Lobby,Issue],
    rootPath: '/admin',
  });

  const router = AdminBroExpress.buildRouter(adminBro);
  app.use(adminBro.options.rootPath, router);

}
