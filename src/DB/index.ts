import colors from 'colors';
import { User } from '../app/modules/user/user.model';
import config from '../config';

import { logger } from '../shared/logger';
import { TUser } from '../app/modules/user/user.interface';

const superUser: TUser = {
  firstName: 'Abdullah',
  lastName: 'Alshahrani',
  role: "ADMIN",
  email: config.super_admin.email!,
  password: config.super_admin.password!,
  verified: true,
  address: 'N/A',
  phoneNumber: 'N/A',
  status: 'active',
};

const seedSuperAdmin = async () => {
  const isExistSuperAdmin = await User.findOne({
    role: 'ADMIN',
  });

  if (!isExistSuperAdmin) {
    await User.create(superUser);
    logger.info(colors.green('✔ Super admin created successfully!'));
  }
};

export default seedSuperAdmin;
