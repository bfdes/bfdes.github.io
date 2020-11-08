FROM node:14 as builder
RUN mkdir /build
COPY . /build/
WORKDIR /build
RUN yarn install --frozen-lockfile
RUN yarn build:prod

FROM node:14
LABEL maintainer="Bruno Fernandes <bfdes@users.noreply.github.com>"
COPY --from=builder /build/dist /app/
WORKDIR /app
EXPOSE 8080
CMD ["node", "server.js"]
