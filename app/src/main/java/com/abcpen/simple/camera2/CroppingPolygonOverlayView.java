package com.abcpen.simple.camera2;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Paint.Style;
import android.graphics.Path;
import android.view.View;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;

import com.abcpen.camera.plugin.IFrameOverlay;

/**
 * 创建时间: 2018/10/25
 * coder: Alaske
 * description：
 */
public class CroppingPolygonOverlayView extends View implements IFrameOverlay {
    private static final int LIVE_EDGE_THRESHOLD = 15;
    private FadingAnimationState mAnimationState;
    private Animation mFadeInAnimation;
    private Animation mFadeOutAnimation;
    private Paint mPaint = null;
    private Path mPath = null;

    private enum FadingAnimationState {
        HIDDEN,
        FADING_IN,
        SHOWN,
        FADING_OUT
    }

    public CroppingPolygonOverlayView(Context context) {
        super(context);
        int commonThemeColor = Color.RED;
        this.mAnimationState = FadingAnimationState.HIDDEN;
        Paint paint = new Paint();
        paint.setColor(commonThemeColor);
        paint.setStyle(Style.STROKE);
        paint.setStrokeWidth((float) ((int) Math.round(2d * getResources().getDisplayMetrics().density)));
        this.mPaint = paint;
        this.mFadeInAnimation = createAlphaAnimation(true);
        this.mFadeOutAnimation = createAlphaAnimation(false);
    }


    private void startFadeOutAnimation() {
        startAnimation(this.mFadeOutAnimation);
        this.mAnimationState = FadingAnimationState.FADING_OUT;
    }

    private void startFadeInAnimation() {
        startAnimation(this.mFadeInAnimation);
        this.mAnimationState = FadingAnimationState.FADING_IN;
    }

    @Override
    public View getView() {
        return this;
    }

    public boolean updateAnimationState(boolean hasCroppingQuad, boolean isSimilarToLast) {
        if (FadingAnimationState.FADING_IN == this.mAnimationState && this.mFadeInAnimation.hasEnded()) {
            this.mAnimationState = FadingAnimationState.SHOWN;
        }
        if (FadingAnimationState.FADING_OUT == this.mAnimationState && this.mFadeOutAnimation.hasEnded()) {
            this.mAnimationState = FadingAnimationState.HIDDEN;
        }
        switch (this.mAnimationState) {
            case HIDDEN:
                if (!hasCroppingQuad) {
                    return false;
                }
                startFadeInAnimation();
                return true;
            case FADING_IN:
                if (hasCroppingQuad && isSimilarToLast) {
                    return true;
                }
                clearAnimation();
                startFadeOutAnimation();
                return false;
            case SHOWN:
                if (hasCroppingQuad && isSimilarToLast) {
                    return false;
                }
                startFadeOutAnimation();
                return false;
            case FADING_OUT:
                return false;
            default:
                throw new IllegalStateException("Unexpected animation state: " + this.mAnimationState.toString());
        }
    }


    private Animation createAlphaAnimation(boolean fadeIn) {
        Animation animation = fadeIn ? new AlphaAnimation(0.0f, 0.9f) : new AlphaAnimation(0.9f, 0.0f);
        animation.setDuration(fadeIn ? 200 : 350);
        animation.setFillAfter(true);
        return animation;
    }

    protected void onDraw(Canvas canvas) {
        if (this.mPath != null) {
            canvas.drawPath(this.mPath, this.mPaint);
        }
    }

    public void updatePath(float[] points) {
        if (points == null || points.length == 0) {
            this.mPath = null;
        } else {
            Path path = new Path();
            path.moveTo(points[0], points[1]);
            int length = points.length;
            for (int i = 1; i < length / 2; i++) {
                path.lineTo(points[i * 2], points[(i * 2) + 1]);
            }
            path.close();
            this.mPath = path;
        }
        update();
    }

    @Override
    public void clean() {

    }

    public void update() {
        invalidate();
    }
}
