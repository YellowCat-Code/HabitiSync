import { BaseSideService } from '@zeppos/zml/base-side';

AppSideService(
  BaseSideService({
    onRequest(req, res) {
      try {
        if (req.method === 'GET_CREDENTIALS') {
          // Read values stored by settings/index.js
          const UserName = this.settings.getItem('UserName');
          const Password = this.settings.getItem('Password');

          return res(null, {
            UserName: UserName || null,
            Password: Password || null,
          });
        } else {
          // Always send a response to prevent timeout
          return res(new Error(`Unknown method: ${req.method}`));
        }
      } catch (error) {
        console.error('Error in GET_CREDENTIALS:', error);
        return res(error);
      }
    },
  }),
);