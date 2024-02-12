ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8

WORKDIR /server

ADD package.json .


RUN \ 
   apk add --no-cache \
        nodejs \
        npm

# Copy data for add-on
ADD Orvibo ./Orvibo
COPY run.sh .
COPY index.js .

RUN chmod a+x run.sh

CMD ["./run.sh"]