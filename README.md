# API rate limiter

## Context

Corporation X,Y,Z is a tech company that has launched a notification service for sending SMS and
E-mail notifications. They are selling this service to different clients and each client has specific
limits on the number of requests they can send in a month. Because they are a startup they have a
limited amount of infrastructure to serve all clients at peak capacity because their solution has
been very successful. Each client has the ability to pay for more requests per second. Corporation
X,Y,Z is seeing performance issues on their api, because they haven't implemented the limits that
have been set out in the software.

## Requirements

The design question is, how should they try to solve these three issues:

1. Too many requests within the same time window from a client
2. Too many requests from a specific client on a per month basis
3. Too many requests across the entire system

## Points to look for:

● The rate limiting should work for a distributed setup, as the APIs are accessible through a
cluster of servers.
● How would you handle throttling (soft and hard throttling etc.).
