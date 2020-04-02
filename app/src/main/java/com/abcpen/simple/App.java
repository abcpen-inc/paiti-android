package com.abcpen.simple;

import android.app.Application;
import android.util.Log;

import com.abcpen.answer.ABCPaiTiManager;
import com.abcpen.callback.ABCRefreshTokenCallback;
import com.abcpen.callback.ABCRefreshTokenResultCallback;
import com.abcpen.camera.utils.AUtils;
import com.abcpen.model.GetTokenModel;
import com.abcpen.net.RequestMethod;
import com.abcpen.net.rest.AsyncRequestExecutor;
import com.abcpen.net.rest.OnResponseListener;
import com.abcpen.net.rest.Request;
import com.abcpen.net.rest.Response;
import com.abcpen.net.rest.StringRequest;
import com.abcpen.net.tools.MD5Util;
import com.abcpen.util.PaitiPrefAppStore;
import com.google.gson.Gson;

import static com.abcpen.answer.ABCPaiTiManager.BASE_URL;

/**
 * Created by zhaocheng on 2018/4/12.
 */

public class App extends Application {

    //使用者提供验证用户是否为网站用户的认证url
    //测试用例提供笔声的用户体系验证api
    //TODO 用户需要替换这里
    final static private String app_id = null;
    final static private String appSecret = null;
    private static final String AUTH_URL = BASE_URL + "/auth/token";

    @Override
    public void onCreate() {
        super.onCreate();
        AUtils.init(this);
        //初始化
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
                objectRequest.add("expiration", 7200);
                //public params
                objectRequest.add("version", "V1.0.0");
                objectRequest.add("deviceType", "1");
                objectRequest.add("appVersion", "1.0");
                objectRequest.add("deviceId", PaitiPrefAppStore.getDeviceUUID(App.this));
                objectRequest.add("channel", "paitisdk_android");
                AsyncRequestExecutor.INSTANCE.execute(0, objectRequest, new OnResponseListener<String>() {
                    @Override
                    public void onStart(int what) {

                    }

                    @Override
                    public void onSucceed(int what, Response<String> response) {
//                        Log.e("APP", response.get());
                        Gson gson = new Gson();
                        GetTokenModel model = gson.fromJson(response.get(), GetTokenModel.class);
                        if (model.success && model.data != null) {
                            if (callback != null)
                                callback.onRefreshComplete(model.data.accessToken);
                            Log.e("pati", "onSuccessd " + model.data.accessToken);
                        } else {
                            if (callback != null) {
                                callback.onRefreshFailed();
                            }
                        }
//                        callback.onRefreshComplete();
                    }

                    @Override
                    public void onFailed(int what, Response<String> response) {
                        Log.e("GetToken", response.toString());
                    }

                    @Override
                    public void onFinish(int what) {

                    }
                });
            }
        });
    }

}
