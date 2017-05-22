#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_dictionary.h"
#include "ppapi/cpp/var_array_buffer.h"
#include "iostream"
#include <opencv2/core/core.hpp>
#include "skin.h"
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

      auto width  = dictionary.Get("width").AsInt();
      auto height = dictionary.Get("height").AsInt();
      auto uuid = dictionary.Get("uuid").AsString();

      auto original_data      = pp::VarArrayBuffer(dictionary.Get("data"));
      uint8_t* original_bytes = static_cast<uint8_t*>(original_data.Map());
      auto original_img       = cv::Mat(height, width, CV_8UC4, original_bytes);

      auto processed_img = Mat(original_img.size(), CV_8UC4);
      hideSkin(original_img, processed_img);

      auto processed_bytes = processed_img.elemSize() * processed_img.total();
      pp::VarArrayBuffer processed_data(processed_bytes);
      uint8_t* copy = static_cast<uint8_t*>( processed_data.Map());
      memcpy( copy, processed_img.data, processed_bytes );

      pp::VarDictionary msg;
      msg.Set("type", "processed");
      msg.Set("data", processed_data);
      msg.Set("uuid", uuid);
      PostMessage(msg);
    }
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
