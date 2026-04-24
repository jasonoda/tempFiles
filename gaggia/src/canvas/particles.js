var particles = [];

function particleLoop(){

    for(var i=0; i<particles.length; i++){

        if(particles[i]!==null){

            if(particles[i].name==="rollOverDot"){

                // particles[i].w+=251*dt;
                // particles[i].h+=251*dt;
                // // particles[i].a-=2*dt;
                // particles[i].a = lerp(particles[i].a,0,dt*10);
                // if(particles[i].a<=0.05){
                //     destroySprite(particles[i]);
                // }

                if(facingRightDirection===true){
                    particles[i].visible=true;
                }else{
                    particles[i].visible=false;
                }

                // particles[i].lp.x = particles[i].follow.lp.x;
                // particles[i].lp.y = particles[i].follow.lp.y;

                // if(particles[i].a>particles[i].follow.a){
                    // particles[i].a=particles[i].follow.a;
                // }

                particles[i].count+=dt;
                if(particles[i].count>8 || section!==particles[i].section){
                    destroySprite(particles[i]);
                }

            }

        }

    }

}