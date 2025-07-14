// modules/upload.js
import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import path from 'path';

// AWS S3 세팅 (환경변수로 관리 권장)
const s3 = new AWS.S3({
  region: 'ap-southeast-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
// 확장자 필터링 (이미지 전용)
const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('이미지 파일만 업로드할 수 있습니다.'), false);
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'express-deploy-test', // S3 버킷 이름으로 교체
    acl: 'public-read', // 공개 URL로 접근하려면
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      // S3에 저장될 파일 이름 지정
      const filename = Date.now() + '-' + file.originalname;
      cb(null, filename);
    }
  }),
  fileFilter
});

export default upload;