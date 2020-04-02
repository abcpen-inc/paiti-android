package com.abcpen.simple.camera2;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Point;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.view.Display;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.RadioGroup;

import com.abcpen.camera.listener.OnCropViewListener;
import com.abcpen.camera.listener.PhotoProcessTaskCallBack;
import com.abcpen.camera.photoprocess.CroppingQuad;
import com.abcpen.camera.photoprocess.PhotoProcessMode;
import com.abcpen.camera.photoprocess.PhotoProcessTask;
import com.abcpen.camera.photoprocess.ProcessParam;
import com.abcpen.camera.photoprocess.ProcessResult;
import com.abcpen.camera.utils.PhotoUtil;
import com.abcpen.camera.view.CropView;
import com.abcpen.simple.R;

/**
 * 创建时间: 2018/10/25
 * coder: Alaske
 * description：
 */
public class CropFragment extends Fragment implements View.OnClickListener {

    public static final String PATH = "PATH";
    public static final String CROPPING_QUAD = "CROPPING_QUAD";

    private View rootView;
    private CropView cropView;
    private RadioGroup radioGroup;
    private PhotoProcessMode photoProcessMode = PhotoProcessMode.NOFILTER;
    private Bitmap orgBitmap;
    private ImageView rotateView;
    private CroppingQuad croppingQuad;
    private ImageView ivResult;
    private OnCropFragmentListener cropFragmentListener;
    private Bitmap cropBitmap;
    private Button btnCropDone;

    public void setCropFragmentListener(OnCropFragmentListener cropFragmentListener) {
        this.cropFragmentListener = cropFragmentListener;
    }

    public interface OnCropFragmentListener {
        void onResult(Bitmap bitmap);

        void onFail();
    }


    public static CropFragment getInstance(String path,
                                           CroppingQuad croppingQuad, OnCropFragmentListener cropFragmentListener) {
        CropFragment cropFragment = new CropFragment();
        Bundle bundle = new Bundle();
        bundle.putString(PATH, path);
        bundle.putParcelable(CROPPING_QUAD, croppingQuad);
        cropFragment.setArguments(bundle);
        cropFragment.setCropFragmentListener(cropFragmentListener);
        return cropFragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        rootView = inflater.inflate(R.layout.fm_crop, container, false);
        cropView = rootView.findViewById(R.id.crop_view);
        rotateView = rootView.findViewById(R.id.crop_image_rotate);
        ivResult = rootView.findViewById(R.id.iv_result);
        ivResult.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                
            }
        });
        btnCropDone = rootView.findViewById(R.id.btn_done);
        btnCropDone.setVisibility(View.GONE);
        rotateView.setTag(0);
        rotateView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                int rotate = (int) rotateView.getTag();
                rotate += 90;
                if (rotate == 360) {
                    rotate = 0;
                }
                rotateView.setTag(rotate);
                cropView.setBitmapRotate(rotate);
            }
        });
        //放大镜
        cropView.setCropMagnifierEnabled(true);
        rootView.findViewById(R.id.btn_cancel).setOnClickListener(this);
        rootView.findViewById(R.id.btn_done).setOnClickListener(this);
        rootView.findViewById(R.id.btn_reset).setOnClickListener(this);
        radioGroup = rootView.findViewById(R.id.rg_group);
        initData();
        return rootView;
    }


    @Override
    public void onResume() {
        super.onResume();
        getView().setFocusableInTouchMode(true);
        getView().requestFocus();
        getView().setOnKeyListener(new View.OnKeyListener() {
            @Override
            public boolean onKey(View view, int i, KeyEvent keyEvent) {
                if (keyEvent.getAction() == KeyEvent.ACTION_DOWN && i == KeyEvent.KEYCODE_BACK) {
                    if (canBack()) return true;
                }
                return false;
            }
        });

    }

    private boolean canBack() {
        if (ivResult.getVisibility() == View.VISIBLE) {
            ivResult.setVisibility(View.GONE);
            btnCropDone.setVisibility(View.GONE);
            return true;
        }
        return false;
    }

    private void initData() {

        new Thread(new Runnable() {
            @Override
            public void run() {
                String path = getArguments().getString(PATH);
                orgBitmap = BitmapFactory.decodeFile(path);
                croppingQuad = getArguments().getParcelable(CROPPING_QUAD);
                if (croppingQuad == null) {
                    croppingQuad = PhotoUtil.getCroppingQuad(orgBitmap)[0];
                }
                getActivity().runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Display display = getActivity().getWindowManager().getDefaultDisplay();
                        Point size = new Point();
                        display.getSize(size);
                        cropView.setScreenLandscapeWidth(Math.max(size.x, size.y));
                        cropView.setCropData(orgBitmap, croppingQuad);
                    }
                });
            }
        }).start();

        radioGroup.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(RadioGroup radioGroup, int i) {
                PhotoProcessMode p = photoProcessMode;
                switch (i) {
                    case R.id.rb_document:
                        photoProcessMode = PhotoProcessMode.DOCUMENT;
                        break;
                    case R.id.rb_photo:
                        photoProcessMode = PhotoProcessMode.PHOTO;
                        break;
                    case R.id.rb_whiteboard:
                        photoProcessMode = PhotoProcessMode.WHITEBOARD;
                        break;
                }
                if (p != photoProcessMode) {
                    p = photoProcessMode;
                    cropView.setPhotoProcessMode(p);
                    if (true) {
                        cropView.cropDone(cropListener);
                    } else {
                        //或者使用 如果在其他页面做此操作 只需要保留 原始图片 和 裁剪区域的CroppingQuad 即可
                        CroppingQuad cropQuad = cropView.getCropQuad();
                        PhotoProcessTask photoProcessTask = new PhotoProcessTask(new PhotoProcessTaskCallBack() {
                            @Override
                            public void onProcessFail() {

                            }

                            @Override
                            public void onProcessSuccess(ProcessResult processResult) {
                                cropListener.onCropResult(processResult);
                            }

                        });
                        ProcessParam param = new ProcessParam();
                        param.croppingQuad = cropQuad;
                        param.rotation = cropView.getBitmapRotation();
                        param.bitmap = orgBitmap;
                        param.photoProcessMode = p;
                        param.isAutoCrop = true;
                        photoProcessTask.execute(param);
                    }
                }
            }
        });

    }

    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.btn_cancel:
                if (!canBack()) {
                    getActivity().onBackPressed();
                }
                break;
            case R.id.btn_done:
                if (cropFragmentListener != null && cropBitmap != null) {
                    cropFragmentListener.onResult(cropBitmap);
                }
                break;
            case R.id.btn_reset:
                canBack();
                cropView.reset();
                rotateView.setTag(0);
                break;
        }
    }

    private OnCropViewListener cropListener = new OnCropViewListener() {

        @Override
        public void onCropResult(ProcessResult processResult) {
            cropBitmap = processResult.cropBitmap;
            btnCropDone.setVisibility(View.VISIBLE);
            ivResult.setVisibility(View.VISIBLE);
            ivResult.setImageBitmap(cropBitmap);
        }

        @Override
        public void onCropFail() {

        }
    };


}
