export default function (result,eventId) {
    if(result==-1){
        return "DNF";
    }
    if(result==-2){
        return "DNS";
    }
    if(result==0){
        return "";
    }
    let resultStr=null;
    if("333fm"==eventId){
        if(result>1000){
            resultStr=(result/100).toString()
        }else{
            resultStr=result.toString();
        }
    }else if("333mbf"==eventId){
        let mbfDifference=99-parseInt(result/10000000);
        let mbfMissed=result%100;
        let mbfSolved=mbfDifference+mbfMissed;
        let mbfAttempted=mbfSolved+mbfMissed;
        let mbfTime=parseInt(result/100);
        let mbfSec=mbfTime%10000;
        let mbfMin=mbfSec/60;
        mbfSec%=60;
        if(mbfSec<10){
            mbfSec="0"+mbfSec.toString()
        }
        resultStr=`${mbfSolved}/${mbfAttempted} ${mbfMin}:${mbfSec}`;
    }else{
        let sec=parseInt(result/100);
        let msec=result%100;
        if(msec<10){
            msec="0"+msec.toString()
        }
        if(sec>59){
            let min=parseInt(sec/60);
            sec%=60;
            if(sec<10){
                sec="0"+sec.toString()
            }
            resultStr=`${min}:${sec}.${msec}`
        }else {
            resultStr=`${sec}.${msec}`
        }
    }
    return resultStr;
}
