package com.abcpen.simple;

import android.Manifest;
import android.content.Intent;
import android.os.Bundle;
import android.os.Environment;
import android.support.annotation.Nullable;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import com.abcpen.answer.ABCPaiTiManager;
import com.abcpen.callback.ABCFileCallBack;
import com.abcpen.callback.ABCPaiTiAnswerListener;
import com.abcpen.model.PaitiResultModel;
import com.abcpen.simple.camera2.Camera2Activity;
import com.tbruyelle.rxpermissions2.RxPermissions;

import java.io.File;

import io.reactivex.functions.Consumer;
import pub.devrel.easypermissions.EasyPermissions;

/**
 * Created by zhaocheng on 2018/4/12.
 */

public class MainActivity extends AppCompatActivity implements ABCFileCallBack<String>, ABCPaiTiAnswerListener {

    public static final int PHOTO_CODE = 0x001;
    public static final int READ_PHONE_PERMISSON_CODE = 0x002;

    private Button btnOpenCamera, btnOpenCamera2, btnDemoClick;

    private TextView tvUploadProgress;

    private StringBuffer sb;


    public void openCamera(View view) {
        RxPermissions permissions = new RxPermissions(this);
        permissions.request(Manifest.permission.CAMERA, Manifest.permission.WRITE_EXTERNAL_STORAGE, Manifest.permission.READ_EXTERNAL_STORAGE)
                .subscribe(new Consumer<Boolean>() {
                    @Override
                    public void accept(Boolean aBoolean) throws Exception {
                        if (aBoolean) {
                            Intent intent = new Intent(MainActivity.this, SmartCameraCropActivity.class);
                            startActivityForResult(intent, PHOTO_CODE);
                        }
                    }
                });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == RESULT_OK && requestCode == PHOTO_CODE) {
            String filePath = data.getStringExtra(SmartCameraCropActivity.PHOTO_URI);
            Log.e("onActivityResult", filePath);
            ABCPaiTiManager.getInstance().getImageQuestionByLocalPath(filePath, getPath());
        }
    }

    /**
     * luban get Image path
     *
     * @return
     */
    private static String getPath() {
        String path = Environment.getExternalStorageDirectory() + "/Luban/image/";
        File file = new File(path);
        if (file.mkdirs()) {
            return path;
        }
        return path;
    }


    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {

        // 如果需要使用COS 初始化cos的参数
        super.onCreate(savedInstanceState);
        setContentView(R.layout.ac_main);
        sb = new StringBuffer();
        sb.append("Log");
        btnOpenCamera = findViewById(R.id.btn_open_camera);
        btnOpenCamera2 = findViewById(R.id.btn_open_camera2);
        btnDemoClick = findViewById(R.id.btn_demo);
        tvUploadProgress = findViewById(R.id.tv_upload_progress);
        tvUploadProgress.setText(sb.toString());
        updateAuthOKUI();

        if (!EasyPermissions.hasPermissions(this, Manifest.permission.READ_PHONE_STATE)) {
            EasyPermissions.requestPermissions(this, "请允许读取手机信息", READ_PHONE_PERMISSON_CODE
                    , Manifest.permission.READ_PHONE_STATE);
        }

        ABCPaiTiManager.getInstance().registerOnReceiveListener(this);
        ABCPaiTiManager.getInstance().setABCFileCallback(this);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        ABCPaiTiManager.getInstance().unRegisterOnReceiveListener(this);
    }

    private void updateAuthOKUI() {
        this.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                btnOpenCamera.setVisibility(View.VISIBLE);
                btnOpenCamera2.setVisibility(View.VISIBLE);
                btnDemoClick.setVisibility(View.VISIBLE);
            }
        });
    }

    @Override
    public void onSuccess(final String orgPath, String url) {
        Log.d("MainActivity onSuccess", url);
        updateUploadProgress(sb.append("\n上传成功 " + "url == " + url).toString());
    }

    @Override
    public void onFail(final String orgPath, final String e) {
        updateUploadProgress(sb.append("\n上传失败 " + orgPath + "e " + e).toString());
    }

    @Override
    public void onUploadProgress(final String orgPath, final float progress) {
        updateUploadProgress(sb.append("\n orgPath " + orgPath + "===>progress" + progress).toString());
    }

    @Override
    public void onAnswerData(final String path, final String imageUrl, PaitiResultModel.AnswerModelWrapper model) {
        if (model == null) {
            updateUploadProgress(sb.append("\n识别失败 imageUrl: " + imageUrl + " localPath: " + path).toString());
        } else {
            ResultActivity.startResultActivity(
                    MainActivity.this, imageUrl, "",
                    model.result);
            updateUploadProgress(sb.append("\n识别成功 : " + imageUrl + " localPath: " + path).toString());
        }
    }

    private void updateUploadProgress(final String text) {
        this.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                tvUploadProgress.setText(text);
            }
        });
    }

    public void openCamera2(View view) {
        Camera2Activity.startCameraActivity(this, PHOTO_CODE);
    }

}
