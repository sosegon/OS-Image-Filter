#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_dictionary.h"
#include "ppapi/cpp/var_array_buffer.h"
#include "iostream"
#include <opencv2/core/core.hpp>
#include "skin.h"
#include <string>
#include <stdio.h>
using namespace std;

namespace {
  // const char* const kjpeg= "jpeg";
  // const char* const kpng= "png";
  const char* const kbase64= "base64";
  const char* const karraybuffer= "arraybuffer";
  static const std::string base64_chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  "abcdefghijklmnopqrstuvwxyz"
  "0123456789+/";
}  // namespace

class HelloTutorialInstance : public pp::Instance {
 public:
  explicit HelloTutorialInstance(PP_Instance instance)
      : pp::Instance(instance) {}
  virtual ~HelloTutorialInstance() {}

  virtual void HandleMessage(const pp::Var& var_message) {
    fprintf(stdout,"logmsg: %s\n", kbase64);
    if (var_message.is_dictionary()) {
      pp::VarDictionary dictionary(var_message);
      pp::VarArray keys = dictionary.GetKeys();

      // common parameters for arraybuffer and base64 data
      auto width  = dictionary.Get("width" ).AsInt();
      auto height = dictionary.Get("height").AsInt();
      auto uuid   = dictionary.Get("uuid"  ).AsString();
      auto type   = dictionary.Get("type"  ).AsString();
      auto format = dictionary.Get("format").AsString();
      auto source = dictionary.Get("source").AsString();
      auto type2  = dictionary.Get("type2").AsString();

      // Reference to image once processed the arraybuffer or base64 data
      cv::Mat original_img;

      // Extract image from data
      if(type == karraybuffer) {
        auto original_data = pp::VarArrayBuffer(dictionary.Get("data"));
        original_img = ArrayBufferToMat(original_data, width, height);
      } 
      else { // type == kbase64
        LogMessage(source);
        auto original_data = dictionary.Get("data").AsString();
        original_img = ConvertTo4Channels(Base64ToMat(original_data));
        string my_msg = source + " - " + to_string(original_img.size().width) + " - " +
        to_string(original_img.size().height);
        LogMessage(my_msg);
      }

      // Do the processing to hide the skin
      auto processed_img = cv::Mat(original_img.size(), CV_8UC4);
      hideSkin(original_img, processed_img);

      // Get the data from the processed image
      auto processed_bytes = processed_img.elemSize() * processed_img.total();
      pp::VarArrayBuffer processed_data(processed_bytes);
      uint8_t* copy = static_cast<uint8_t*>( processed_data.Map());
      memcpy(copy, processed_img.data, processed_bytes);

      // Common parameters for output message
      pp::VarDictionary msg;
      msg.Set("width",  width  );
      msg.Set("height", height );
      msg.Set("uuid",   uuid   );
      msg.Set("kind",   "image");
      msg.Set("format", format );
      msg.Set("source", source );
      msg.Set("type2",  type2  );

      if(type == karraybuffer) {
        msg.Set("type", karraybuffer);
        msg.Set("data", processed_data);
      }
      else { // type == kbase64
        auto processed_bytes = original_img.elemSize() * original_img.total();
        pp::VarArrayBuffer processed_data(processed_bytes);
        uint8_t* copy = static_cast<uint8_t*>( processed_data.Map());
        memcpy(copy, original_img.data, processed_bytes);

        msg.Set("type", kbase64);
        msg.Set("data", processed_data);
      }

      PostMessage(msg);
    }
  }

  void LogMessage(string const& message) {
    pp::VarDictionary msg;
    msg.Set("kind", "log"  );
    msg.Set("data", message);

    PostMessage(msg);
  }

  Mat ConvertTo4Channels(Mat source) {
    cv::Mat newSrc(source.size(), CV_MAKE_TYPE(source.type(), 4));
    int from_to[] = { 0,0, 1,1, 2,2, 3,3 };
    cv::mixChannels(&source, 2, &newSrc, 1, from_to, 4);

    return newSrc;
  }

  Mat ArrayBufferToMat(pp::VarArrayBuffer& arrabuffer, int width, int height) {
    uint8_t* bytes = static_cast<uint8_t*>(arrabuffer.Map());
    auto image = cv::Mat(height, width, CV_8UC4, bytes);
    return image;
  }

  Mat Base64ToMat(string const& encoded_string) {
    string decoded_string = DecodeBase64(encoded_string);
    vector<uchar> data(decoded_string.begin(), decoded_string.end());
    cv::Mat img = cv::imdecode(data, CV_LOAD_IMAGE_COLOR);

    return img;
  }

  static inline bool is_base64(unsigned char c) {
    return (isalnum(c) || (c == '+') || (c == '/'));
  }

  string EncodeBase64(unsigned char const* bytes_to_encode, unsigned int in_len) {
    std::string ret;
    int i = 0;
    int j = 0;
    unsigned char char_array_3[3];
    unsigned char char_array_4[4];

    while (in_len--) {
      char_array_3[i++] = *(bytes_to_encode++);
      if (i == 3) {
        char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
        char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
        char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
        char_array_4[3] = char_array_3[2] & 0x3f;

        for(i = 0; (i <4) ; i++)
          ret += base64_chars[char_array_4[i]];
        i = 0;
      }
    }

    if (i)
    {
      for(j = i; j < 3; j++)
        char_array_3[j] = '\0';

      char_array_4[0] = ( char_array_3[0] & 0xfc) >> 2;
      char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
      char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
      char_array_4[3] =   char_array_3[2] & 0x3f;

      for (j = 0; (j < i + 1); j++)
        ret += base64_chars[char_array_4[j]];

      while((i++ < 3))
        ret += '=';

    }

    return ret;
  }

  string DecodeBase64(string const& encoded_string) {
    int in_len = encoded_string.size();
    int i = 0;
    int j = 0;
    int in_ = 0;
    unsigned char char_array_4[4], char_array_3[3];
    std::string ret;

    while (in_len-- && (encoded_string[in_] != '=') && is_base64(encoded_string[in_])) {
        char_array_4[i++] = encoded_string[in_]; in_++;
        if (i == 4) {
            for (i = 0; i < 4; i++)
                char_array_4[i] = base64_chars.find(char_array_4[i]);

            char_array_3[0] = (char_array_4[0] << 2) + ((char_array_4[1] & 0x30) >> 4);
            char_array_3[1] = ((char_array_4[1] & 0xf) << 4) + ((char_array_4[2] & 0x3c) >> 2);
            char_array_3[2] = ((char_array_4[2] & 0x3) << 6) + char_array_4[3];

            for (i = 0; (i < 3); i++)
                ret += char_array_3[i];
            i = 0;
        }
    }

    if (i) {
        for (j = i; j < 4; j++)
            char_array_4[j] = 0;

        for (j = 0; j < 4; j++)
            char_array_4[j] = base64_chars.find(char_array_4[j]);

        char_array_3[0] = (char_array_4[0] << 2) + ((char_array_4[1] & 0x30) >> 4);
        char_array_3[1] = ((char_array_4[1] & 0xf) << 4) + ((char_array_4[2] & 0x3c) >> 2);
        char_array_3[2] = ((char_array_4[2] & 0x3) << 6) + char_array_4[3];

        for (j = 0; (j < i - 1); j++) ret += char_array_3[j];
    }
    return ret;
  } 
};

class HelloTutorialModule : public pp::Module {
 public:
  HelloTutorialModule() : pp::Module() {}
  virtual ~HelloTutorialModule() {}

  virtual pp::Instance* CreateInstance(PP_Instance instance) {
    return new HelloTutorialInstance(instance);
  }
};

namespace pp {

Module* CreateModule() {
  return new HelloTutorialModule();
}

}  // namespace pp
