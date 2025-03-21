#!/bin/bash
psql -U postgres -d PokerTrackerDb -c 'SELECT "Id", "UserName", "Email" FROM "AspNetUsers";'
