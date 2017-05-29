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
}  // namespace

class HelloTutorialInstance : public pp::Instance {
 public:
  explicit HelloTutorialInstance(PP_Instance instance)
      : pp::Instance(instance) {}
  virtual ~HelloTutorialInstance() {}

  virtual void HandleMessage(const pp::Var& var_message) {
    if (var_message.is_dictionary()) {
      pp::VarDictionary dictionary(var_message);
      pp::VarArray keys = dictionary.GetKeys();

      // Parameters
      auto uuid   = dictionary.Get("uuid"  ).AsString();
      auto width  = dictionary.Get("width" ).AsInt();
      auto height = dictionary.Get("height").AsInt();
      auto origin = dictionary.Get("origin").AsString();

      // Extract image from data
      auto original_data = pp::VarArrayBuffer(dictionary.Get("data"));

      // Reference to image once processed the arraybuffer or base64 data
      cv::Mat original_img = ArrayBufferToMat(original_data, width, height);

      // Do the processing to hide the skin
      auto processed_img = cv::Mat(original_img.size(), CV_8UC4);
      hideSkin(original_img, processed_img);

      // Get the data from the processed image
      auto processed_bytes = processed_img.elemSize() * processed_img.total();
      pp::VarArrayBuffer processed_data(processed_bytes);
      uint8_t* copy = static_cast<uint8_t*>( processed_data.Map());
      memcpy(copy, processed_img.data, processed_bytes);

      // Set parameters for output message
      pp::VarDictionary msg;
      msg.Set("width",  width  );
      msg.Set("height", height );
      msg.Set("uuid",   uuid   );
      msg.Set("origin", origin );
      msg.Set("data", processed_data);

      PostMessage(msg);
    }
  }

  Mat ArrayBufferToMat(pp::VarArrayBuffer& arrabuffer, int width, int height) {
    uint8_t* bytes = static_cast<uint8_t*>(arrabuffer.Map());
    auto image = cv::Mat(height, width, CV_8UC4, bytes);
    return image;
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
