const multer = require("multer");
const SrvException = require("../util/exception");

const IMAGE_UPLOAD_PATH = "uploads/images";

const imageUpload = multer({
  limits: 1024 * 1024,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, IMAGE_UPLOAD_PATH);
    },
    filename: (req, file, cb) => {
      const fileInfos = file.mimetype.split("/");
      if (fileInfos.length !== 2) {
        cb(
          new SrvException(
            400,
            `Invalid image file mimetype(${file.mimetype}).`
          ),
          ""
        );
      } else {
        const ext = fileInfos[1];
        cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
      }
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = file.mimetype.startsWith("image");
    const error = isValid ? null : new SrvException(400, "Invalid image file.");
    cb(error, isValid);
  },
});

const getImageFilePath = (fileName) => {
  if (fileName) {
    return `${IMAGE_UPLOAD_PATH}/${fileName}`;
  } else {
    return null;
  }
};

module.exports = { imageUpload, getImageFilePath };
