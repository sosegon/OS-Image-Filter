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

// The expected string sent by the browser.
//const char* const kHelloString = "hello";
// The string sent back to the browser upon receipt of a message
// containing "hello".
//const char* const kReplyDictionary = "Dictionary received";
const char* const kReplyNotDictionary = "Dictionary not received";
//const char* const kMessageKey = "image";

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

      auto width = dictionary.Get("width").AsInt();
      auto height = dictionary.Get("height").AsInt();
      auto data = pp::VarArrayBuffer(dictionary.Get("data"));

      uint8_t* byteData = static_cast<uint8_t*>(data.Map());
      auto img = cv::Mat(height, width, CV_8UC3, byteData);
      auto result = Mat(img.size(), CV_8UC3);
      hideSkin(img, result);

      auto nBytes = result.elemSize() * result.total();
      pp::VarDictionary msg;
      pp::VarArrayBuffer data2(nBytes);
      uint8_t* copy = static_cast<uint8_t*>( data2.Map());
      memcpy( copy, result.data, nBytes );

      msg.Set( "Type", "completed" );
      msg.Set( "Data", data2 );
      PostMessage( msg );

      // for (int i = 0; i < keys.GetLength(); i++){
      //   pp::Var var_reply(keys.Get(i).AsString());
      //   PostMessage(var_reply);
      // }
    } else {
      pp::Var var_reply = pp::Var(kReplyNotDictionary);
      PostMessage(var_reply);
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
