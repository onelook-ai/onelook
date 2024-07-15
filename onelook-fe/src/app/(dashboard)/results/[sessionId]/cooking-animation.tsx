import classes from './cooking-animation.module.css';

export default function CookingAnimation() {
  return (
    <div className={classes.cooking}>
      <div className={classes.bubble}></div>
      <div className={classes.bubble}></div>
      <div className={classes.bubble}></div>
      <div className={classes.bubble}></div>
      <div className={classes.bubble}></div>
      <div className={classes.area}>
        <div className={classes.sides}>
          <div className={classes.pan}></div>
          <div className={classes.handle}></div>
        </div>
        <div className={classes.pancake}>
          <div className={classes.pastry}></div>
        </div>
      </div>
    </div>
  );
}
