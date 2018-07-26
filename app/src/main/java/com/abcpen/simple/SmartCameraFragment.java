package com.abcpen.simple;

import android.app.ProgressDialog;
import android.content.Intent;
import android.graphics.Point;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.provider.MediaStore;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.OrientationEventListener;
import android.view.Surface;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.Toast;

import com.abcpen.camera.sdk.AspectRatio;
import com.abcpen.camera.sdk.CameraView;
import com.abcpen.camera.sdk.call.CameraCropListen;
import com.abcpen.simple.util.Util;
import com.abcpen.simple.view.RotateImageView;

import java.util.Set;


/**
 * 拍照功能页面
 * Created by zhaocheng on 15/9/29.
 */
public class SmartCameraFragment extends Fragment implements View.OnClickListener {

    //view
    private CameraView mCameraView;
    private RotateImageView mFlashView, mTakeImageView, mAlbumImageView, mGuiderImageView, mTakeCancel;
    private ProgressDialog progressDialog = null;
    //data
    private int triggerFlashMode = 0;
    private ImageView mTiShiIv;
    private Uri saveUri;
    private String cacheDir;
    private CameraCropListen cameraCropListen;
    private int formType;

    //orientation
    private int current_orientation = 0;
    private OrientationEventListener orientationEventListener = null;

    public void setCameraCropListen(CameraCropListen cameraCropListen) {
        this.cameraCropListen = cameraCropListen;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_smart_camera, null);
        init(view);
        return view;
    }

    public void setFromType(int formType) {
        this.formType = formType;
    }

    private void init(View view) {
        mCameraView = (CameraView) view.findViewById(R.id.camera);
        mCameraView.addCallback(new CameraView.Callback() {
            @Override
            public void onCameraOpened(CameraView cameraView) {
                super.onCameraOpened(cameraView);
                WindowManager windowManager = getActivity().getWindowManager();
                Point point = new Point();
                windowManager.getDefaultDisplay().getRealSize(point);

                mCameraView.setPictureSize(point.y, point.x);
            }

            @Override
            public void onCameraClosed(CameraView cameraView) {
                super.onCameraClosed(cameraView);
            }

            @Override
            public void onPictureTakeSuccess(CameraView cameraView, Uri uri) {
                if (progressDialog != null && progressDialog.isShowing()) {
                    progressDialog.dismiss();
                }
                if (uri == null) return;
                mCameraView.stop();
                if (cameraCropListen != null) cameraCropListen.takePhotoSuccess(uri);
            }

            @Override
            public void onPictureTakeFail(CameraView cameraView) {
                if (progressDialog != null && progressDialog.isShowing()) {
                    progressDialog.dismiss();
                }
                Toast.makeText(getActivity(), "拍取图片失败", Toast.LENGTH_SHORT).show();
                //getActivity().finish();
            }
        });
        mTakeImageView = (RotateImageView) view.findViewById(R.id.iv_take_photo_democf);
        //mTakeImageView.setEnabled(false);

        mFlashView = (RotateImageView) view.findViewById(R.id.flash_toggle_iv);
        mTiShiIv = (ImageView) view.findViewById(R.id.tishiiv);
        mGuiderImageView = (RotateImageView) view.findViewById(R.id.guideriv);
        mTakeCancel = (RotateImageView) view.findViewById(R.id.take_pic_cancel);
        mAlbumImageView = (RotateImageView) view.findViewById(R.id.open_album_iv);

        mTakeImageView.setOnClickListener(this);
        mFlashView.setOnClickListener(this);
        mGuiderImageView.setOnClickListener(this);
        mTakeCancel.setOnClickListener(this);
        mAlbumImageView.setOnClickListener(this);

        Message msg1 = new Message();
        msg1.what = 1;
        handler.sendMessageDelayed(msg1, 1000);

        changUIForFromType();

        //initSaveUri();

        orientationEventListener = new OrientationEventListener(getActivity()) {
            @Override
            public void onOrientationChanged(int orientation) {
                SmartCameraFragment.this.onOrientationChanged(orientation);
            }
        };

        layoutUI();
    }

    private void changUIForFromType() {
        mTakeImageView.setImageResource(R.drawable.selector_tea_camera_vertical);
        mAlbumImageView.setImageResource(R.drawable.ic_album_nor);
        mTakeCancel.setImageResource(R.drawable.ic_cancle_nor);
    }


    private void onOrientationChanged(int orientation) {

        if (orientation == OrientationEventListener.ORIENTATION_UNKNOWN)
            return;
        int diff = Math.abs(orientation - current_orientation);
        if (diff > 180)
            diff = 360 - diff;
        if (diff > 60) {
            orientation = (orientation + 45) / 90 * 90;
            orientation = orientation % 360;
            if (orientation != current_orientation) {
                this.current_orientation = orientation;
                layoutUI();
            }
        }
    }

    private void layoutUI() {
        int rotation = getActivity().getWindowManager().getDefaultDisplay().getRotation();
        int degrees = 0;
        switch (rotation) {
            case Surface.ROTATION_0:
                degrees = 0;
                break;
            case Surface.ROTATION_90:
                degrees = 90;
                break;
            case Surface.ROTATION_180:
                degrees = 180;
                break;
            case Surface.ROTATION_270:
                degrees = 270;
                break;
        }

        int relative_orientation = (current_orientation + degrees) % 360;
        int ui_rotation = (360 - relative_orientation) % 360;
        Log.d("zc", "ui_rotation" + ui_rotation);
        mFlashView.setOrientation(-ui_rotation, true);
        mTakeImageView.setOrientation(-ui_rotation, true);
        mAlbumImageView.setOrientation(-ui_rotation, true);
        mTakeCancel.setOrientation(-ui_rotation, true);
        mGuiderImageView.setOrientation(-ui_rotation, true);
//        mCameraView.setUIRotation(ui_rotation);
    }


   /* private void initSaveUri() {
        if (Environment.MEDIA_MOUNTED.equals(Environment.getExternalStorageState())) {
            cacheDir = Environment.getExternalStorageDirectory().getAbsolutePath()
                    + "/Android/data/" + getActivity().getPackageName() + "/paiti/image/";
            File file = new File(cacheDir);
            if (!file.exists()) file.mkdirs();
        } else {
            // 内部存储
            cacheDir = getActivity().getFilesDir().getAbsolutePath() + "/";
        }
        cacheDir += System.currentTimeMillis();
        saveUri = Uri.parse("file://" + cacheDir);
        mCameraView.setSavePhotoUri(saveUri);
    }*/

    @Override
    public void onResume() {
        super.onResume();
//        Log.d("zc", "cameraFragment onResume");
        mCameraView.start();
        Set<AspectRatio> supportedAspectRatios = mCameraView.getSupportedAspectRatios();
        Log.i("pq", "supportedAspectRatios" + supportedAspectRatios.size());
        for (AspectRatio i : supportedAspectRatios) {
            Log.i("pq", i.toString());
        }
        //AspectRatio aspectRatio =AspectRatio.of(1080,1920);
        //AspectRatio[] aspectRatios = supportedAspectRatios.toArray(new AspectRatio[supportedAspectRatios.size()]);
//        mCameraView.setAspectRatio(aspectRatios[3]);
        orientationEventListener.enable();
    }


    @Override
    public void onHiddenChanged(boolean hidden) {
        super.onHiddenChanged(hidden);
        if (hidden) {
            mCameraView.stop();
        } else {
            mCameraView.start();
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        Log.d("zc", "cameraFragment onPause");
        mCameraView.stop();
        orientationEventListener.disable();
    }

    /**
     * 相册
     */
    private void openAlbum() {
        Intent openAlbumIntent = new Intent(Intent.ACTION_PICK,
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        getActivity().startActivityForResult(openAlbumIntent,
                SmartCameraCropActivity.ALBUM_REQUEST_CODE);
        getActivity().overridePendingTransition(android.R.anim.fade_in,
                android.R.anim.fade_out);

    }

    /**
     * 帮助
     */
    private void openHelp() {
        startActivity(TakePhotoGuider.getIntent(getActivity()));
    }

    /**
     * 取消拍照
     */
    private void cancelTakePhoto() {
        getActivity().finish();
    }

    /**
     * 切换闪光灯
     */
    private void changeFlash() {
        triggerFlashMode = ++triggerFlashMode % 3;
        int drawable = R.drawable.ic_flash_auto;
        if (triggerFlashMode == 0) {
            drawable = R.drawable.ic_flash_off;
            mCameraView.setFlash(CameraView.FLASH_OFF);
        } else if (triggerFlashMode == 1) {
            drawable = R.drawable.ic_flash_on;
            mCameraView.setFlash(CameraView.FLASH_ON);
        } else if (triggerFlashMode == 2) {
            drawable = R.drawable.ic_flash_auto;
            mCameraView.setFlash(CameraView.FLASH_AUTO);
        }
        mFlashView.setImageResource(drawable);
    }

    /**
     * 拍照
     */
    private void takePhoto() {
        if (progressDialog == null) {
            progressDialog = new ProgressDialog(getActivity());
        }
        progressDialog.setMessage("图片处理中...");
        progressDialog.show();

        mCameraView.takePicture();
    }


    Handler handler = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            if (getActivity() == null || getActivity().isFinishing()) {
                return;
            }
            animImageView(msg);
        }
    };


    Animation.AnimationListener animationListener = new Animation.AnimationListener() {
        @Override
        public void onAnimationStart(Animation animation) {

        }

        @Override
        public void onAnimationEnd(Animation animation) {
            Message msg2 = new Message();
            msg2.what = 2;
            handler.sendMessageDelayed(msg2, 1000);
        }

        @Override
        public void onAnimationRepeat(Animation animation) {

        }
    };

    private void animImageView(Message msg) {
        switch (msg.what) {

            case 1:
                Animation mAnimation_tishi = AnimationUtils.loadAnimation(
                        getActivity(), R.anim.loading_camera);
                mAnimation_tishi.setAnimationListener(animationListener);
                mAnimation_tishi.setFillAfter(true);
                mTiShiIv.startAnimation(mAnimation_tishi);
                break;

            case 2:
                mTiShiIv.clearAnimation();
                mTiShiIv.setVisibility(View.INVISIBLE);
                break;

        }
    }

    /**
     * 子工程中 不能使用switch(v.getId()) 因 报错问题 转换为 if else...
     *
     * @param v
     */
    @Override
    public void onClick(View v) {
        if (Util.isFastClick()) return;
        if (v.getId() == R.id.iv_take_photo_democf) {

            takePhoto();

        } else if (v.getId() == R.id.flash_toggle_iv) {

            changeFlash();

        } else if (v.getId() == R.id.guideriv) {

            openHelp();

        } else if (v.getId() == R.id.take_pic_cancel) {

            cancelTakePhoto();

        } else if (v.getId() == R.id.open_album_iv) {

            openAlbum();
        }

    }


   /* @Override
    public void onTakePhotoCompile(Uri uri) {
        if (progressDialog != null && progressDialog.isShowing()) {
            progressDialog.dismiss();
        }
        if (uri == null) return;
        mCameraView.stop();
        if (cameraCropListen != null) cameraCropListen.takePhotoSuccess(uri);
    }

    @Override
    public void onTakePhotoFail() {
        if (progressDialog != null && progressDialog.isShowing()) {
            progressDialog.dismiss();
        }
        getActivity().finish();
    }*/

    /*@Override
    public void onSurfaceCreated() {


    }

    @Override
    public void onSurfaceDestroyed() {
    }

    @Override
    public void onTryAutoFocus(boolean success) {
        if (success)
            mTakeImageView.setEnabled(true);
        else
            mTakeImageView.setEnabled(false);
    }*/


}
