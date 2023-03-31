const canvas = document.querySelector('canvas')
canvas.width = innerWidth
canvas.height = innerHeight

const c = canvas.getContext('2d')


const centerX = canvas.width/2
const centerY = canvas.height/2

const EnemyColors = ['green','pink','violet','yellow','cyan','orange']
let Bullets = []
let Enemies = []
let explosions = []

const scoreElement = document.querySelector('.score')
let score = 0

const startButton = document.querySelector('.startButton')
const scoreBoard = document.querySelector('.scoreBoard')
const scoreInsideScoreBoard = document.querySelector('.scoreInsideScoreBoard')


class Player{
    constructor(x, y , color , radius){
        this.x = x
        this.y = y
        this.color = color
        this.radius = radius
    }
    
    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,360,false)
        c.fillStyle = this.color
        c.fill()
    }
}
 
class Bullet{
    constructor(x,y,color,radius,velocity){
        this.x= x
        this.y= y
        this.color = color
        this.radius = radius
        this.velocity = velocity
    }

    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,360,false)
        c.fillStyle = this.color
        c.fill()
    }

    move(){
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }

}

let player = new Player(centerX, centerY,'white',15)
player.draw()

class Enemy{
    constructor(x,y,color,radius,velocity){
        this.x= x
        this.y= y
        this.color = color
        this.radius = radius
        this.velocity = velocity
    }

    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,360,false)
        c.fillStyle = this.color
        c.fill()
    }

    move(){
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }

}

const Friction = 0.99
class Explosion{
    constructor(x,y,color,radius,velocity){
        this.x= x
        this.y= y
        this.color = color
        this.radius = radius
        this.velocity = velocity
        this.alpha = 1
    }

    draw(){
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,360,false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    move(){
        this.draw()
        this.velocity.x *= Friction
        this.velocity.y *= Friction
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.alpha -= .02
    }

}

function spawnEnemy(){
     setInterval(()=>{
        let x 
        let y 

        const RandomValue = Math.random()
        if(RandomValue > 0 && RandomValue < 0.25 ){
            x = 0
            y = Math.random()*canvas.height
        }
        else if( RandomValue > 0.25 && RandomValue < 0.50){
            x = canvas.width
            y = Math.random()*canvas.height
        }
        else if(RandomValue > 0.50 && RandomValue < 0.75){
            y =0
            x = Math.random()*canvas.height
        }
        else if(RandomValue > 0.75 && RandomValue < 1.0){
            y = canvas.height
            x = Math.random()*canvas.height
        }



        const angle = Math.atan2( centerY - y , centerX - x)

        const Velocity = {
            x : Math.cos(angle),
            y :  Math.sin(angle)
        }
    
        const EnemyColorIndex = parseInt(Math.random()*EnemyColors.length)
        Enemies.push(new Enemy(x,y,EnemyColors[EnemyColorIndex],Math.random()*30+10,Velocity))

    },1000)

}

let AnimationId
function animate(){
    AnimationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0, 0.1)'
    c.fillRect(0,0,canvas.width,canvas.height)
    player.draw()

    //create explosions
    explosions.forEach((explosion,explosionIndex)=>{
        explosion.move()
        if(explosion.alpha <= 0){
            explosions.splice(explosionIndex,1)
        }
    })
    Bullets.forEach((bullet,bulletIndex)=>{
        bullet.move()

        //remove extra bullets (optimization)
        if(bullet.x - bullet.radius < 1 
            || bullet.x + bullet.radius > (canvas.width + 50)
            || bullet.y - bullet.radius < 1 
            || bullet.y + bullet.radius > (canvas.height+50))
            {
                setTimeout(()=>{
                    Bullets.splice(bulletIndex,1)
                },0000)
            }
    })
    Enemies.forEach((enemy,EnemyIndex)=>{
        enemy.move()
        //check for bullet and enemy colision
        Bullets.forEach((bullet,BulletIndex)=>{
            const distanceBetweenEnemyAndBullet = Math.hypot( bullet.x - enemy.x, enemy.y - bullet.y)

            if(distanceBetweenEnemyAndBullet - enemy.radius < 1){

                //set new explosions on hit
                for(let i = 0;i< (enemy.radius*2)-2 ;i++){
                    explosions.push(new Explosion(
                        bullet.x,
                        bullet.y,
                        enemy.color, 
                        Math.random()*2 ,
                         { 
                            x : (Math.random() - 0.5) * Math.random()*6 ,
                            y : (Math.random() - 0.5) * Math.random()*6  
                        }))
                }

                if(enemy.radius > 15){
                    gsap.to(enemy,{
                        radius: enemy.radius -10
                    })

                    //ubdate score when enemy srinks in size
                    score += 60
                    scoreElement.innerHTML = score

                    setTimeout(()=>{
                        Bullets.splice(BulletIndex,1)
                    },001)
                }
                else{

                      //ubdate score when enemy removed from screen
                      score += 120
                      scoreElement.innerHTML = score
                    setTimeout(()=>{
                        Enemies.splice(EnemyIndex,1)
                        Bullets.splice(BulletIndex,1)
                    },001)
                }
            }
        })

        //check for player and enemy collision
        const distanceBetweenEnemyAndPlayer = Math.hypot(enemy.x - player.x , enemy.y - player.y)
        if(distanceBetweenEnemyAndPlayer  - player.radius - enemy.radius + 5< 1){
            cancelAnimationFrame(AnimationId)
            scoreInsideScoreBoard.innerHTML = score
            scoreBoard.style.display = 'flex'
        }
    })
}


let count = 0
addEventListener('click',(e)=>{
    count++
    const angle = Math.atan2(e.clientY - centerY , e.clientX - centerX)

    const Velocity = {
        x : Math.cos(angle) * 3,
        y :  Math.sin(angle) * 3
    }

    Bullets.push(new Bullet( centerX,centerY,'white',8,Velocity))

    if(count == 1){
        spawnEnemy()
    }
})


function Init(){ //reset all the arrays and player
     Bullets = []
     Enemies = []
     explosions = []
     score = 0
     scoreElement.innerHTML = score
     player = new Player(centerX, centerY,'white',15)

}
startButton.addEventListener('click',()=>{
    Init()
    scoreBoard.style.display = 'none'
    animate()
})
