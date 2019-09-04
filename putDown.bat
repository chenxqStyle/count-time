chcp 65001

echo  ======= 准备关机 =======

ping -n 5 127.0.0.1

start cmd /k  node F:\count-time\index.js off 


echo 即将关机.....

ping -n 10 127.0.0.1

echo ======= 10s后关机 =======

shutdown -s -t 10

