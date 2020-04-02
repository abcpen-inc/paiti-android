# 拍题SDK V1.0.1

## Maven库集成

```gradle

   repositories {
        maven { url "http://nexus.abcpen.com/repository/android/" }
        ...
    }
    implementation 'com.abcpen:open_camera:1.0.1'
    implementation 'com.abcpen:recognition:1.0.1'

    implementation('com.abcpen:open_camera2:1.0.0', {
        exclude group: 'com.android.support', module: '*'
    })

```
## 填写APPID
参考App.java 文件 头部位置

## 初始化SDK

```
 
 **强烈建议在服务端实现此处获取token的代码
 //用户自行初始化，并且提供获取app token的方法，参考下面refreshToken 的实现，
 
 ABCPaiTiManager.getInstance().init(this, new ABCRefreshTokenCallback() {
            @Override
            public void refreshToken(final ABCRefreshTokenResultCallback callback) {

                //发送http请求

                Request<String> objectRequest = new StringRequest(AUTH_URL, RequestMethod.POST);
                final long timeStamp = System.currentTimeMillis();
                final String sign = MD5Util.MD5Encode(app_id + timeStamp + appSecret, "utf8");

                objectRequest.add("appId", app_id);
                objectRequest.add("timestamp", timeStamp);
                objectRequest.add("sign", sign);
                objectRequest.add("expiration", 600); //这里时间可以设置的长一些
                AsyncRequestExecutor.INSTANCE.execute(0, objectRequest, new OnResponseListener<String>() {
                    @Override
                    public void onStart(int what) {

                    }

                    @Override
                    public void onSucceed(int what, Response<String> response) {
                        Gson gson = new Gson();
                        GetTokenModel model = gson.fromJson(response.get(), GetTokenModel.class);
                        if (model.success && model.data != null) {
                            if (callback != null)
                                callback.onRefreshComplete(model.data.accessToken);
                        } else {
                            if (callback != null) {
                                callback.onRefreshFailed();
                            }
                        }
                    }

                    @Override
                    public void onFailed(int what, Response<String> response) {

                    }

                    @Override
                    public void onFinish(int what) {

                    }
                });
            }

        });
```




## 相机(CameraView)
>-  CameraView 使用方式和普通View一直 Xml布局中直接使用

```
  <com.abcpen.camera.sdk.CameraView
        android:id="@+id/camera"
        android:layout_width="match_parent"
        android:layout_height="match_parent"/>

```

>- 初始化CameraView

```java
 void initCamera(Activity activity, Bundle savedInstanceState, OnPreviewStatusChangeListen onSurfaceCreatedListen)
```

>- 设置拍照回调

```java
//设置拍照回调
void setCameraResultListener(CameraTakePhotoLister lister)


interface CameraTakePhotoLister {
    //拍照成功
    void onTakePhotoCompile(Uri uri);
    //拍照失败
    void onTakePhotoFail();

}

```
>- 设置照片地址

```java 

 void setSavePhotoUri(Uri savePhotoUri)
 
```

>- 拍照

**拍照后会通过回调 返回拍照 成功 / 失败**

``` java
void takePhoto()
```

>- 后台操作

```java

// 切换 后台时候 释放相机
void onPause()

// 恢复相机
void onResume()

```

>- 其他Api

```java
  
  //相机旋转角度
  void setUIRotation(int uiRotation)
  
  //设置闪光灯 0关闭 1开启 2自动模式
  setFlash(int flash)
  
```

>- 添加网格

**SDK默认是不带网格的 如果需要使用 覆盖在Cameraview上 透明即可**


## 图片处理(ABCImageProcessingUtil)

>- SDK提供了 文字矫正 以及 图片质量识别 灰度图等

**文字矫正功能 会剪切图片 自动模式有剪切最大角度限制 文字倾斜度不可超过±15°   所有方法都可以在其他线程中操作**



 ```java
    //文字矫正  自动模式 SDK内部默认矫正最
    Bitmap changeAngleFont(Bitmap bitmap)
    
    //获取文字倾斜度 可自行处理
    float getAngleForBitMap(Bitmap bitmap)
    
    //获取图片质量是否合格
    boolean getBlurStatus(Bitmap bitmap)
    
    //转成灰度图
    Bitmap toGrayscale(Bitmap bmpOriginal)

 ```



>- CallBack介绍

```java
   /**
     * 上传成功
     * @param t
     */
    void onSuccess(T t);

    /**
     * 上传失败
     * @param e
     */
    void onFail(Exception e);

    /**
     * 上传进度
     * @param progress
     */
    void onUploadProgress(float progress);
​````
**上传成功后会返回图片id 后面答案识别成功后会对应此图片ID**

## 答案识别
​``` java
// 注册图片识别 监听
registerOnReceiveListener(ABCPaiTiAnswerListener listener)

// 销毁监听 
unRegisterOnReceiveListener(ABCPaiTiAnswerListener listener)   

```
## 拍图识别 (ABCPaiTiManager)



```
    
    //本地图片处理
    ABCPaiTiManager.getInstance().getImageQuestionByLocalPath(filePath,outputFolder,this);

    //网络图片处理
    ABCPaiTiManager.getInstance().
    getImageQuestionByRemoteUrl("http://cos.abcpen.com/155324242632055726916.png");

	
	@Override
    public void onAnswerData(final String localPath, final String imageUrl, PaitiResultModel.AnswerModelWrapper model) {
    
    	//v0.8.7 本地文件路径 路径地址输入为，参考onActivityResult 的图片拍摄完成部分传入的地址
       if (model == null) {
            updateUploadProgress(sb.append("\n识别失败 imageUrl: " + imageUrl + " localPath: " + path).toString());
        } else {
            ResultActivity.startResultActivity(
                    MainActivity.this, imageUrl, "",
                    model.result);
            updateUploadProgress(sb.append("\n识别成功 : " + imageUrl + " localPath: " + path).toString());
        }
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == RESULT_OK && requestCode == PHOTO_CODE) {
            String filePath = data.getStringExtra(SmartCameraCropActivity.PHOTO_URI);
            Log.e("onActivityResult", filePath);
            
            //同onAnswerData的地址，用来做tag
            ABCPaiTiManager.getInstance().getImageQuestionByLocalPath(filePath, getPath());
        }
    }
```

**注册监听后 要记得销毁监听 不然会引起内存泄漏**

>- 监听说明

```java

  /**
     * 答案识别成功
     * @param imgId
     * @param paSingleModel
     */
    void onAnswerData(final String imageUrl, PaitiResultModel.AnswerModelWrapper model);

```

>- Model说明

Model | 说明
---|---
AnswrModel | 题目model 

**返回data会包含所有搜题结果列表，数组中每个item都是以下类型的model **


```java


public class AnswerModel implements Parcelable {
	//题目id
   
    @SerializedName("subject")
    public int subject;
    @SerializedName("question_id")
    public String question_id;
    @SerializedName("question_body")
    public String question_body;
    @SerializedName("question_body_html")
    public String question_html;
    @SerializedName("answer_analysis")
    public String answer_analysis;
    @SerializedName("question_tag")
    public String question_tag;
    @SerializedName("question_answer")
    public String quesiton_answer;
    @SerializedName("score")
 
	...
}

```



### HTML的方式展示。

步骤： 1，页面HTML，拷贝 main/assets 文件夹下www目录到app的对应目录中


2，拷贝demo 中的jsplugin目录下所有java文件（MyPlugin，Answer，ClassModel）和 res 的config.xml目录到app的对应文件夹。

注意：这里Myplugin如果修改包名，请在config.xml中也修改成相应的包名

	//xml file in res
	<feature name="MyPlugin">
	    	<param name="android-package" value="com.abcpen.simple.jsplugin.MyPlugin" />
	</feature>

3，参考ResultActivity ，使用cordovawebview加载页面
	
	        loadUrl("file:///android_asset/www/index.html");

4，参考ResultActivity 实现showquestion等的调用装载数据的逻辑

	 public JSONObject showQuestion() {
	    	if (TextUtils.isEmpty(mImageId) || mContent == null || mContent.size() == 0) {
	   	   	  return showEmptyQuestion();
	   		 }
	   		 return genQuestionObj(2);
	   		 }



**V0.9.0新增修改**

1，修改StartCropfragment.java 初始化选择框的大小

```
if (cropWidth > 1024)
    cropWidth = 1024;
    ...
if (cropHeight > 1024)
    cropHeight = 1024;
```

2，修改highlightView.java

```
if (rect.width() > 1024)
    rect.right = rect.left + 1024;
if (rect.height() > 1024)
    rect.bottom = rect.top + 1024;
    ...
```

3, 修改如果裁剪的图片过大（宽或者高大于1024）直接返回MainActivity onFail()

```
abcFileCallBack.onFail(path, "image Width Or Height > 1024");
```

备注：修改地方均用

```
//v0.9.0 add 
...
//#end v0.9.0 add
```

标志出来，全文搜索即可
