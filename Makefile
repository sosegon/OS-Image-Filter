# Copyright (c) 2012 The Native Client Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

#
# GNU Make based build file.  For details on GNU Make see:
# http://www.gnu.org/software/make/manual/make.html
#

NACL_ARCH := x86_32 x86_64

VALID_TOOLCHAINS := clang-newlib

NACL_SDK_ROOT := $(NACL_SDK_ROOT)

include $(NACL_SDK_ROOT)/tools/common.mk

TARGET = skin_hidder

#LDFLAGS := -lopencv_objdetect -lopencv_imgproc -lopencv_core -lz
CFLAGS = -Wall -std=gnu++11
SOURCES = \
	src/skin.cpp \
	src/main.cpp \

# Libraries and dependencies
# Dependencies need to be rebuild everytime, while libraries are not
LIBS = $(DEPS) ppapi_cpp ppapi pthread opencv_imgproc opencv_core z

$(foreach dep,$(DEPS),$(eval $(call DEPEND_RULE,$(dep))))
$(foreach src,$(SOURCES),$(eval $(call COMPILE_RULE,$(src),$(CFLAGS))))

ifeq ($(CONFIG),Release)
$(eval $(call LINK_RULE,$(TARGET)_unstripped,$(SOURCES),$(LIBS),$(DEPS)))
$(eval $(call STRIP_RULE,$(TARGET),$(TARGET)_unstripped))
else
$(eval $(call LINK_RULE,$(TARGET),$(SOURCES),$(LIBS),$(DEPS)))
endif

$(eval $(call NMF_RULE,$(TARGET),))