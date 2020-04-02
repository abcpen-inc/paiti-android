package com.abcpen.simple.camera2;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Paint.Style;
import android.graphics.Rect;
import android.view.View;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;

import com.abcpen.camera.plugin.IBracketsDrawer;

/**
 * 创建时间: 2018/10/25
 * coder: Alaske
 * description：
 */
public class BracketsDrawerView extends View implements IBracketsDrawer {
    private Animation mAnimation;
    private boolean mIsShowing;
    private Paint mPaint;
    private Rect mRect;

    public BracketsDrawerView(Context context) {
        super(context);
        this.mIsShowing = false;
        this.mRect = null;
        this.mAnimation = null;
        this.mPaint = null;
        this.mAnimation = createAnimation();
        Paint paint = new Paint();
        paint.setColor(Color.RED);
        paint.setStyle(Style.STROKE);
        paint.setStrokeWidth(2.0f);
        this.mPaint = paint;
    }

    private Animation createAnimation() {
        Animation animation = new AlphaAnimation(0.1f, 1.0f);
        animation.setRepeatCount(-1);
        animation.setRepeatMode(2);
        animation.setDuration(50);
        animation.setFillEnabled(false);
        return animation;
    }

    protected void onDraw(Canvas canvas) {
        if (this.mIsShowing && this.mRect != null && this.mPaint != null) {
            canvas.drawRect(this.mRect, this.mPaint);
        }
    }

    public void update() {
        invalidate();
    }

    public void showBrackets() {
        if (!this.mIsShowing) {
            this.mIsShowing = true;
            update();
        }
    }

    public void hideBrackets() {
        if (this.mIsShowing) {
            this.mIsShowing = false;
            stopAnimation();
            update();
        }
    }

    public void startAnimation() {
        if (this.mAnimation != null) {
            startAnimation(this.mAnimation);
        }
    }

    public void stopAnimation() {
        clearAnimation();
        update();
    }

    public void setRect(Rect rect) {
        this.mRect = rect;
    }

    @Override
    public View getView() {
        return this;
    }

    @Override
    public void beginFocusRect(Rect rect) {
        setRect(rect);
        showBrackets();
        startAnimation();
    }

    @Override
    public void endFocusSuccess(Rect rect) {
        stopAnimation();
    }
}
