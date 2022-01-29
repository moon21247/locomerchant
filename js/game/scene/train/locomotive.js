import {Vector} from "../../../math/vector.js";
import {Wagon} from "./wagon.js";
import {Utils} from "../../../math/utils.js";
import {Wheel} from "./wheel.js";
import {Sprites} from "../../sprite/sprites.js";
import {Sounds} from "../../audio/sounds.js";

export class Locomotive {
    static WHEEL_RADIUS_DRIVE = Wagon.WHEEL_RADIUS;
    static WHEEL_RADIUS_SMALL = 36.5;
    static SUSPENSION_HEIGHT = Wagon.SUSPENSION_HEIGHT;
    static SUSPENSION_STIFFNESS = .01;
    static SUSPENSION_DAMPING = .07;
    static FLOOR = 50;
    static FURNACE_WIDTH = 120;
    static LEVER_LENGTH = 100;
    static LEVER_WIDTH = 40;
    static LEVER_X = 100;
    static HEAT_MAX = 25;

    constructor(engine, position, width, height) {
        const bodyPosition = new Vector(
            position.x - width * .5,
            position.y - height * .5 - Locomotive.WHEEL_RADIUS_DRIVE - Locomotive.SUSPENSION_HEIGHT);

        this.width = width;
        this.height = height;
        this.wheelDriveLeft = new Wheel(
            new Vector(position.x - width + 1.5 * Locomotive.WHEEL_RADIUS_DRIVE, position.y - Locomotive.WHEEL_RADIUS_DRIVE),
            Locomotive.WHEEL_RADIUS_DRIVE,
            Sprites.WAGON_WHEEL);
        this.wheelDriveRight = new Wheel(
            new Vector(position.x - width + 4 * Locomotive.WHEEL_RADIUS_DRIVE, position.y - Locomotive.WHEEL_RADIUS_DRIVE),
            Locomotive.WHEEL_RADIUS_DRIVE,
            Sprites.WAGON_WHEEL);
        this.wheelSmallLeft = new Wheel(
            new Vector(position.x - 5.5 * Locomotive.WHEEL_RADIUS_SMALL, position.y - Locomotive.WHEEL_RADIUS_SMALL),
            Locomotive.WHEEL_RADIUS_SMALL,
            Sprites.LOCOMOTIVE_WHEEL_SMALL);
        this.wheelSmallRight = new Wheel(
            new Vector(position.x - 3.2 * Locomotive.WHEEL_RADIUS_SMALL, position.y - Locomotive.WHEEL_RADIUS_SMALL),
            Locomotive.WHEEL_RADIUS_SMALL,
            Sprites.LOCOMOTIVE_WHEEL_SMALL);
        this.boilerWidth = this.width * .5 - Locomotive.FURNACE_WIDTH * .5;
        this.leverAngle = Math.PI * -.5;
        this.leverAnglePrevious = this.leverAngle;
        this.leverAngleTarget = this.leverAngle;
        this.leverPosition = new Vector(Locomotive.LEVER_X, this.height - Locomotive.FLOOR);
        this.furnaceItems = [];
        this.heat = 0;
        this.heatPrevious = this.heat;
        this.heatTarget = this.heat;
        this.velocity = 0;
        this.brakePrevious = 0;

        const parts = [
            this.furnace = Matter.Bodies.rectangle(
                bodyPosition.x,
                bodyPosition.y,
                Locomotive.FURNACE_WIDTH,
                height,
                {
                    isSensor: true
                }),
            // Floor
            Matter.Bodies.rectangle(
                bodyPosition.x,
                bodyPosition.y + height * .5 - Locomotive.FLOOR * .5,
                width,
                Locomotive.FLOOR),
            // Boiler
            Matter.Bodies.rectangle(
                bodyPosition.x + width * .5 - this.boilerWidth * .5,
                bodyPosition.y,
                this.boilerWidth,
                height),
            // Cabin
            this.cabin = Matter.Bodies.rectangle(
                bodyPosition.x - width * .5 + this.boilerWidth * .5,
                bodyPosition.y,
                this.boilerWidth,
                height),
        ];

        this.body = Matter.Body.create({
            parts: parts,
            collisionFilter: {
                group: -1
            }
        });

        this.centerShift = new Vector(
            this.body.position.x - bodyPosition.x,
            this.body.position.y - bodyPosition.y);

        this.bodySpringLeft = Matter.Constraint.create({
            pointA: new Vector(
                bodyPosition.x - width * .5,
                bodyPosition.y - height * .5 - Wagon.SPRING_HEIGHT),
            pointB: new Vector(
                width * -.5 * Wagon.SPRING_CENTER,
                height * -.5),
            bodyB: this.body,
            stiffness: Locomotive.SUSPENSION_STIFFNESS,
            damping: Locomotive.SUSPENSION_DAMPING
        });
        this.bodySpringRight = Matter.Constraint.create({
            pointA: new Vector(
                bodyPosition.x + width * .5,
                bodyPosition.y - height * .5 - Wagon.SPRING_HEIGHT),
            pointB: new Vector(
                width * .5 * Wagon.SPRING_CENTER,
                height * -.5),
            bodyB: this.body,
            stiffness: Locomotive.SUSPENSION_STIFFNESS,
            damping: Locomotive.SUSPENSION_DAMPING
        });

        Matter.Composite.add(engine.world, [this.body, this.bodySpringLeft, this.bodySpringRight]);
    }

    reset() {
        this.furnaceItems = [];
        this.velocity = 0;
        this.heat = 0;
        this.leverAngle = this.leverAngleTarget = Math.PI * -.5;

        Sounds.WHEELS_ACCELERATE.stop();
        Sounds.WHEELS_BRAKE.stop();
    }

    accelerate(delta) {

    }

    furnaceBurning() {
        for (const item of this.furnaceItems) if (item.burning)
            return true;

        return false;
    }

    pullLever(position) {
        const c = Math.cos(this.body.angle);
        const s = Math.sin(this.body.angle);
        const lpx = this.body.position.x - c * this.width * .5 + s * this.height * .5 + c * this.leverPosition.x - s * this.leverPosition.y;
        const lpy = this.body.position.y - s * this.width * .5 - c * this.height * .5 + s * this.leverPosition.x + c * this.leverPosition.y;

        let angle = Math.atan2(position.y - lpy, position.x - lpx);

        if (angle > 0 && angle < Math.PI * .5)
            angle = 0;

        if (angle >= Math.PI * .5 || angle < Math.PI * -.75)
            angle = Math.PI * -.75;

        this.leverAngleTarget = angle;
    }

    updateVelocity() {
        const friction = .998;
        const brakeStrength = .005;
        const brakeBase = .04;
        const accelerate = 1 - Math.min(1, -this.leverAngle / (Math.PI * .5));
        const brake = Math.max(0, (-this.leverAngle - Math.PI * .5) / (Math.PI * .25));
        const velocityPrevious = this.velocity;

        this.velocity *= friction;
        this.velocity += Math.pow(this.heat, .8) * .02 * accelerate;
        this.velocity = Math.max(0, this.velocity - (this.velocity * brakeStrength + brakeBase) * brake);

        if (this.velocity === 0 && velocityPrevious !== 0) {
            Sounds.TRAIN_STOP.play();
            Sounds.WHEELS_ACCELERATE.stop();
            Sounds.WHEELS_BRAKE.stop();
        }

        if (this.velocity > 0) {
            if (velocityPrevious === 0) {
                Sounds.WHEELS_ACCELERATE.play();
                Sounds.TRAIN_STOP.play();
            }

            Sounds.WHEELS_ACCELERATE.setVolume(Math.min(1, this.velocity / 15));
        }

        if (brake > 0 && this.velocity > 0) {
            if (this.brakePrevious === 0)
                Sounds.WHEELS_BRAKE.play();

            Sounds.WHEELS_BRAKE.setVolume(brake * brake * brake);
        }
        else
            Sounds.WHEELS_BRAKE.stop();

        for (const item of this.furnaceItems) if (item.burning) item.burn(accelerate);

        this.brakePrevious = brake;
    }

    move(delta) {
        this.wheelDriveLeft.move(delta);
        this.wheelDriveRight.move(delta);
        this.wheelSmallLeft.move(delta);
        this.wheelSmallRight.move(delta);
    }

    update() {
        this.wheelDriveLeft.update();
        this.wheelDriveRight.update();
        this.wheelSmallLeft.update();
        this.wheelSmallRight.update();

        this.leverAnglePrevious = this.leverAngle;
        this.leverAngle += (this.leverAngleTarget - this.leverAngle) * .7;

        this.heatPrevious = this.heat;
        this.heat += (this.heatTarget - this.heat) * .002;

        const burning = this.furnaceBurning();
        this.heatTarget = 0;

        for (const item of this.furnaceItems) {
            item.burning = item.burnable && burning;

            if (burning)
                this.heatTarget += item.body.mass * item.fuelDensity;
        }

        this.updateVelocity();
    }

    render(context, time) {
        context.save();
        context.translate(
            Utils.lerp(this.body.positionPrev.x, this.body.position.x, time),
            Utils.lerp(this.body.positionPrev.y, this.body.position.y, time));
        context.rotate(Utils.lerp(this.body.anglePrev, this.body.angle, time));
        context.translate(this.width * -.5 - this.centerShift.x, this.height * -.5 - this.centerShift.y);

        Sprites.LOCOMOTIVE.draw(context, -10, -225);

        context.save();
        context.translate(this.leverPosition.x, this.leverPosition.y);
        context.rotate(Utils.lerp(this.leverAnglePrevious, this.leverAngle, time));

        context.fillStyle = "#3a8c5f";
        context.beginPath();
        context.rect(0, -Locomotive.LEVER_WIDTH * .5, Locomotive.LEVER_LENGTH, Locomotive.LEVER_WIDTH);
        context.fill();

        context.restore();

        context.save();
        context.translate(this.width * .8, this.height * .5);

        context.fillStyle = "#b69a3d";
        context.beginPath();
        context.arc(0, 0, Locomotive.LEVER_LENGTH * .8, -Math.PI, 0);
        context.fill();

        context.rotate(-Math.PI + Math.PI * Utils.lerp(this.heatPrevious, this.heat, time) / Locomotive.HEAT_MAX);

        context.fillStyle = "#d33333";
        context.beginPath();
        context.rect(0, -Locomotive.LEVER_WIDTH * .25, Locomotive.LEVER_LENGTH * .8, Locomotive.LEVER_WIDTH * .5);
        context.fill();

        context.restore();

        context.restore();

        this.wheelDriveLeft.render(context, time);
        this.wheelDriveRight.render(context, time);
        this.wheelSmallLeft.render(context, time);
        this.wheelSmallRight.render(context, time);
    }
}