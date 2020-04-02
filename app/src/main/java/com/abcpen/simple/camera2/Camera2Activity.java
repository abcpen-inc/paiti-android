package com.abcpen.simple.camera2;

import android.Manifest;
import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.os.PersistableBundle;
import android.support.annotation.Nullable;
import android.support.v4.app.FragmentActivity;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ImageView;

import com.abcpen.camera.listener.OnCropViewListener;
import com.abcpen.camera.photoprocess.CroppingQuad;
import com.abcpen.camera.utils.ALog;
import com.abcpen.simple.MainActivity;
import com.abcpen.simple.R;
import com.abcpen.simple.SmartCameraCropActivity;
import com.abcpen.simple.util.FileCachePathUtil;
import com.tbruyelle.rxpermissions2.RxPermissions;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

import io.reactivex.functions.Consumer;

/**
 * 创建时间: 2018/10/24
 * coder: Alaske
 * description：
 */
public class Camera2Activity extends FragmentActivity implements CameraFragment.CameraFragmentListener, CropFragment.OnCropFragmentListener {

    private ProgressDialog progressDialog = null;

    public static void startCameraActivity(Activity activity, int reqCode) {
        Intent intent = new Intent(activity, Camera2Activity.class);
        activity.startActivityForResult(intent, reqCode);
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);

        setContentView(R.layout.ac_camera_2);

        RxPermissions permissions = new RxPermissions(this);
        permissions.request(Manifest.permission.CAMERA, Manifest.permission.WRITE_EXTERNAL_STORAGE, Manifest.permission.READ_EXTERNAL_STORAGE)
                .subscribe(new Consumer<Boolean>() {
                    @Override
                    public void accept(Boolean aBoolean) {
                        if (aBoolean) {
                            CameraFragment instance = CameraFragment.getInstance(Camera2Activity.this);
                            getSupportFragmentManager().beginTransaction().replace(R.id.fm_content, instance).commit();
                        }
                    }
                });


    }

    @Override
    public void onSaveInstanceState(Bundle outState, PersistableBundle outPersistentState) {
        super.onSaveInstanceState(outState, outPersistentState);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        return super.onKeyDown(keyCode, event);
    }

    @Override
    public void onTakeSuccess(String orgPath, Bitmap cropBitmap, CroppingQuad croppingQuad) {
        CropFragment instance = CropFragment.getInstance(orgPath, croppingQuad, this);
        getSupportFragmentManager().beginTransaction().replace(R.id.fm_content, instance).addToBackStack(null).commit();
    }

    @Override
    public void onTakeFail() {

    }

    @Override
    public void onSelectAlbumImg(String imagePath) {
        CropFragment instance = CropFragment.getInstance(imagePath, null, this);
        getSupportFragmentManager().beginTransaction().replace(R.id.fm_content, instance).addToBackStack(null).commit();

    }

    @Override
    public void onBackPressed() {
        if (getSupportFragmentManager().getBackStackEntryCount() > 0) {
            getSupportFragmentManager().popBackStackImmediate();
        } else {
            super.onBackPressed();
        }
    }


    @Override
    public void onResult(final Bitmap bitmap) {
        showLoading();

        new Thread(new Runnable() {
            @Override
            public void run() {
                final File cacheImageFile = FileCachePathUtil.getCacheImageFile(Camera2Activity.this, System.nanoTime() + "_crop");
                FileOutputStream fos = null;
                try {
                    fos = new FileOutputStream(cacheImageFile);
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 100, fos);
                } catch (FileNotFoundException e) {
                    ALog.eTag("zc", e.getMessage());
                } finally {
                    if (fos != null) {
                        try {
                            fos.flush();
                            fos.close();
                        } catch (IOException e) {
                        }

                    }
                }

                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Intent intent = new Intent();
                        intent.putExtra(SmartCameraCropActivity.PHOTO_URI, cacheImageFile.getAbsolutePath());
                        setResult(RESULT_OK, intent);
                        finish();
                    }
                });

            }
        }).start();

    }


    private void hideLoading() {
        if (progressDialog != null) {
            progressDialog.dismiss();
        }
    }

    private void showLoading() {
        if (progressDialog == null) {
            progressDialog = new ProgressDialog(this);
        }
        progressDialog.setMessage("图片处理中...");
        progressDialog.show();
    }

    @Override
    public void onFail() {

    }
}
