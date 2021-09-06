import { v2 } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'Cloudinary',
  useFactory: ()=> {
    return v2.config({
      cloud_name: 'plaining-poker',
      api_key: '385731585652159',
      api_secret: 'Gbzjt4pZtkbYDu7NwCh91F59_vQ',
      secure:true
    });
  },
};
