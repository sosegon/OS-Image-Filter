/*
 * cartoon.cpp
 *
 *  Created on: Dec 17, 2016
 *      Author: sebastian
 */
#include "skin.h"

void hideSkin(Mat srcColor, Mat dstColor) {

	Size size = srcColor.size();
	Mat yuv = Mat(size, CV_8UC3);
	cvtColor(srcColor, yuv, CV_BGR2YCrCb);

	Mat mask = Mat(yuv.size(), CV_8UC1);
	colorSegmentation(yuv, mask);
	densityRegularization(yuv, mask);

	const int EDGES_THRESHOLD = 80;
	threshold(mask, mask, EDGES_THRESHOLD, 255, THRESH_BINARY_INV);

	dstColor.setTo(255);
	srcColor.copyTo(dstColor, mask);
}


void colorSegmentation(Mat img, Mat imgFilter) {
	int min_Cr = MINCR,
		max_Cr = MAXCR,
		min_Cb = MINCB,
		max_Cb = MAXCB;

	inRange(img, Scalar(0, min_Cr, min_Cb), Scalar(255, max_Cr, max_Cb), imgFilter);
}

void densityRegularization(Mat img, Mat imgFilter) {
	int erode1 = ERODE_SIZE;
	int dilate1 = DILATE_SIZE;
	Mat sum;
	sum = Mat::zeros(img.rows, img.cols, CV_8UC1);
	uchar op;
	int erode, dilate;
	for (int i = 0; i < img.rows; i += 4) //Cycle over horizontal clusters
	{
		for (int j = 0; j < img.cols; j += 4) //Cycle over vertical clusters
		{
			for (int k = 0; k < 4; k++) //Cycle horizontally within cluster
			{
				for (int l = 0; l < 4; l++) //Cycle vertically within cluster
				{
					if (imgFilter.at<uchar>(i + k, j + l) != 0) sum.at<uchar>(i, j)++;
				}
			}
			if (sum.at<uchar>(i, j) == 0 || i == 0 || j == 0 || i == (img.rows - 4) || j == (img.cols - 4)) op = 0;
			else if (sum.at<uchar>(i, j) > 0 &&  sum.at<uchar>(i, j) < 16) op = 128;
			else op = 255;
			for (int k = 0; k < 4; k++) //Cycle horizontally within cluster
			{
				for (int l = 0; l < 4; l++) //Cycle vertically within cluster
				{
					imgFilter.at<uchar>(i + k, j + l) = op;
				}
			}
		}
	}
	for (int i = 4; i < (img.rows - 4); i += 4) //Cycle over horizontal clusters
	{
		for (int j = 4; j < (img.cols -4); j += 4) //Cycle over vertical clusters
		{
			erode = 0;
			if (imgFilter.at<uchar>(i, j) == 255)
			{
				for (int k = -4; k < 5; k += 4)
				{
					for (int l = -4; l < 5; l += 4)
					{
						if (imgFilter.at<uchar>(i + k, j + l) == 255) erode++;
					}
				}
				if (erode < erode1)
				{
					for (int k = 0; k < 4; k++) //Cycle horizontally within cluster
					{
						for (int l = 0; l < 4; l++) //Cycle vertically within cluster
						{
							imgFilter.at<uchar>(i + k, j + l) = 0;
						}
					}
				}
			}
		}
	}
	for (int i = 4; i < (img.rows - 4); i += 4) //Cycle over horizontal clusters
	{
		for (int j = 4; j < (img.cols - 4); j += 4) //Cycle over vertical clusters
		{
			dilate = 0;
			if (imgFilter.at<uchar>(i, j) < 255)
			{
				for (int k = -4; k < 5; k += 4)
				{
					for (int l = -4; l < 5; l += 4)
					{
						if (imgFilter.at<uchar>(i + k, j + l) == 255) dilate++;
					}
				}
				if (dilate > dilate1)
				{
					for (int k = 0; k < 4; k++) //Cycle horizontally within cluster
					{
						for (int l = 0; l < 4; l++) //Cycle vertically within cluster
						{
							imgFilter.at<uchar>(i + k, j + l) = 255;
						}
					}
				}
			}
			for (int k = 0; k < 4; k++) //Cycle horizontally within cluster
			{
				for (int l = 0; l < 4; l++) //Cycle vertically within cluster
				{
					if (imgFilter.at<uchar>(i + k, j + l) != 255) imgFilter.at<uchar>(i + k, j + l) = 0;
				}
			}
		}
	}

}

