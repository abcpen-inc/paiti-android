package com.abcpen.simple.camera2;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.hardware.Camera;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;

import com.abcpen.camera.ABCCameraView;
import com.abcpen.camera.listener.ABCCameraListener;
import com.abcpen.camera.photoprocess.CroppingQuad;
import com.abcpen.camera.photoprocess.FlashMode;
import com.abcpen.simple.R;

/**
 * 创建时间: 2018/10/25
 * coder: Alaske
 * description：
 */
public class CameraFragment extends Fragment implements ABCCameraListener {

    public static final int ALBUM_REQUEST_CODE = 0x001;

    private ABCCameraView cameraView;
    private ImageView imageView;
    private CameraFragmentListener cameraFragmentListener;

    interface CameraFragmentListener {
        void onTakeSuccess(String orgPath, Bitmap cropBitmap, CroppingQuad croppingQuad);

        void onTakeFail();

        void onSelectAlbumImg(String imagePath);
    }

    public static CameraFragment getInstance(CameraFragmentListener cameraFragmentListener) {
        CameraFragment cameraFragment = new CameraFragment();
        cameraFragment.setCameraListener(cameraFragmentListener);
        return cameraFragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View inflate = inflater.inflate(R.layout.fm_camera, container, false);
        initView(inflate);
        return inflate;
    }

    public void setCameraListener(CameraFragmentListener cameraListener) {
        this.cameraFragmentListener = cameraListener;
    }

    public void initView(View view) {

        view.findViewById(R.id.iv_album).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                openAlbum();
            }
        });

        cameraView = view.findViewById(R.id.abc_camera);
        cameraView.setCameraListener(this);
        //聚焦显示的view
        cameraView.setBracketsDrawer(new BracketsDrawerView(getContext()));
        //边际显示的view
        cameraView.setFrameOverlay(new CroppingPolygonOverlayView(getContext()));

        imageView = view.findViewById(R.id.iv_flash);
        imageView.setTag(0);
        imageView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                int tag = (int) imageView.getTag();
                switch (tag) {
                    case 0:
                        cameraView.setFlashMode(FlashMode.OFF);
                        imageView.setTag(1);
                        imageView.setImageResource(R.drawable.ic_flash_off);
                        break;
                    case 1:
                        cameraView.setFlashMode(FlashMode.ON);
                        imageView.setTag(2);
                        imageView.setImageResource(R.drawable.ic_flash_on);
                        break;
                    case 2:
                        cameraView.setFlashMode(FlashMode.AUTO);
                        imageView.setTag(0);
                        imageView.setImageResource(R.drawable.ic_flash_auto);
                        break;
                }
            }
        });

        cameraView.setShutterCallback(new Camera.ShutterCallback() {
            @Override
            public void onShutter() {

            }
        });
        view.findViewById(R.id.iv_take).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                cameraView.takePicture();
            }
        });


    }

    /**
     * 相册
     */
    private void openAlbum() {
        Intent openAlbumIntent = new Intent(Intent.ACTION_PICK,
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        startActivityForResult(openAlbumIntent,
                ALBUM_REQUEST_CODE);
        getActivity().overridePendingTransition(android.R.anim.fade_in,
                android.R.anim.fade_out);

    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == Activity.RESULT_OK && requestCode == ALBUM_REQUEST_CODE) {
            Uri selectedImage = data.getData();
            if (selectedImage == null) { // HM 1SC , HM1SW ()

                return;
            }
            String[] filePathColumn = {MediaStore.MediaColumns.DATA};
            Cursor cursor = getContext().getContentResolver().query(selectedImage,
                    filePathColumn, null, null, null);
            String imagePath = null;
            if (cursor != null) {
                try {
                    cursor.moveToFirst();
                    int columnIndex = cursor
                            .getColumnIndex(filePathColumn[0]);
                    imagePath = cursor.getString(columnIndex);
                } catch (Exception e) {
                    imagePath = selectedImage.getPath();
                } finally {
                    cursor.close();
                    cursor = null;
                }
            } else {
                imagePath = selectedImage.getPath();
            }
            if (cameraFragmentListener != null) {
                cameraFragmentListener.onSelectAlbumImg(imagePath);
            }
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (cameraView != null) {
            cameraView.startCameraPreview();
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (cameraView != null) {
            cameraView.stopCameraPreview();
        }
    }

    @Override
    public void onTakeSuccess(String orgPath, Bitmap cropBitmap, CroppingQuad croppingQuad) {
        if (cameraFragmentListener != null) {
            cameraFragmentListener.onTakeSuccess(orgPath, cropBitmap, croppingQuad);
        }
    }

    @Override
    public void onTakeFail() {
        if (cameraFragmentListener != null) {
            cameraFragmentListener.onTakeFail();
        }
    }

    @Override
    public void openCameraFail(String str) {

    }

    @Override
    public void onStartPreviewSuccess() {

    }

    @Override
    public void onCameraViewTouchEvent(MotionEvent motionEvent) {

    }

    @Override
    public void onPreviewSizeChange(int i, int i1) {

    }
}
