ARG BUILD_FROM
FROM $BUILD_FROM


RUN \
apk add --update nodejs npm


WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install

# Copy data for add-on
COPY run.sh /
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]

