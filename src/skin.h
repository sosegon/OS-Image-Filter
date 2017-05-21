/*
 * cartoon.h
 *
 *  Created on: Dec 17, 2016
 *      Author: sebastian
 */
#include <opencv2/opencv.hpp>

using namespace cv;
using namespace std;

#define MINCB 77
#define MAXCB 127
#define MINCR 137
#define MAXCR 173
#define ERODE_SIZE 5
#define DILATE_SIZE 3

void hideSkin(Mat srcColor, Mat dstColor);
void colorSegmentation(Mat yuvColor, Mat mask);
void densityRegularization(Mat yuvColor, Mat mask);
